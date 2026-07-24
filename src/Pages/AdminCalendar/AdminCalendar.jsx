import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../Components/AdminSidebar/AdminSidebar';
import AdminHeader from '../../Components/AdminHeader/AdminHeader';
import { getBookings } from '../../utils/bookingStorage';
import { getServiceBays, updateServiceBayStatus, addBayUnavailablePeriod } from '../../utils/serviceBayStorage';
import { BOOKING_STATUS_CONFIG } from '../../constants/bookingStatus';
import { SERVICE_BAY_STATUS } from '../../constants/serviceBayStatus';
import BayManagerModal from '../../Components/BayManagerModal/BayManagerModal';
import './AdminCalendar.css';

export default function AdminCalendar() {
  const [selectedDate, setSelectedDate] = useState(null);
  const [isSchedulePanelOpen, setIsSchedulePanelOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [localBookings, setLocalBookings] = useState([]);
  const [currentDateParam, setCurrentDateParam] = useState(new Date());
  
  // Bay Manager States
  const [bays, setBays] = useState([]);
  const [isBayManagerOpen, setIsBayManagerOpen] = useState(false);
  const [managingBay, setManagingBay] = useState(null); // The bay currently being edited for maintenance/oos

  useEffect(() => {
    updateLocalBookings();
    setBays(getServiceBays());
  }, []);

  const updateLocalBookings = () => {
    setLocalBookings(getBookings());
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleDateClick = (dayStr) => {
    const bookingsForDate = getBookingsForDate(dayStr);
    setSelectedDate(dayStr);

    if (bookingsForDate.length > 0) {
      setIsSchedulePanelOpen(true);
      setToastMessage('');
    } else {
      setIsSchedulePanelOpen(false);
      showToast("No bookings yet for this date.");
    }
  };

  const closePanel = () => {
    setIsSchedulePanelOpen(false);
    setSelectedDate(null);
  };

  const year = currentDateParam.getFullYear();
  const monthName = currentDateParam.toLocaleString('default', { month: 'long' });
  const monthIndex = currentDateParam.getMonth();

  // Generate real calendar days based on current month
  const getDaysInMonth = (year, monthIndex) => {
    const days = [];
    const firstDay = new Date(year, monthIndex, 1);
    const lastDay = new Date(year, monthIndex + 1, 0);
    
    // Previous month padding
    const startDayOfWeek = firstDay.getDay(); 
    const prevMonthLastDay = new Date(year, monthIndex, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      days.push({ day: prevMonthLastDay - i, isPrevMonth: true });
    }
    
    // Current month
    const today = new Date();
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const isToday = today.getDate() === i && today.getMonth() === monthIndex && today.getFullYear() === year;
      days.push({ day: i, isToday, fullDateStr: `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}` });
    }
    
    // Next month padding
    const remaining = 42 - days.length; // Ensure 6 rows of 7
    for (let i = 1; i <= remaining; i++) {
        days.push({ day: i, isNextMonth: true });
    }
    
    return days;
  };

  const calendarDays = getDaysInMonth(year, monthIndex);

  const getBookingsForDate = (dateStringFull) => {
    if (!dateStringFull) return [];
    
    // 1. Gather all actual customer bookings
    const dynamicBookings = localBookings
      .filter(b => b.appointmentDate === dateStringFull)
      .map(b => ({
        id: b.id,
        dateFull: dateStringFull,
        time: `${b.startTime} - ${b.endTime}`,
        vehicle: b.numberPlate,
        customer: b.customerName,
        service: b.serviceName,
        status: BOOKING_STATUS_CONFIG[b.status]?.label || b.status,
        statusClass: BOOKING_STATUS_CONFIG[b.status]?.cssClass || 'status-req-pending',
        bay: b.serviceBay ? `Bay ${b.serviceBay.split('-')[1] || b.serviceBay}` : 'TBD'
      }));

    // 2. Gather maintenance blocks for visual Calendar representation
    for (const bay of bays) {
      if (bay.status === SERVICE_BAY_STATUS.MAINTENANCE && bay.unavailablePeriods) {
        for (const period of bay.unavailablePeriods) {
          if (period.startDate === dateStringFull) {
            dynamicBookings.push({
              id: period.id || `maint-${bay.id}-${period.startTime}`,
              dateFull: dateStringFull,
              time: `${period.startTime} - ${period.endTime}`,
              vehicle: 'Maintenance',
              customer: 'Internal',
              service: period.reason || 'Routine Maintenance',
              status: 'Maintenance',
              // Use a distinct styling for maintenance
              statusClass: 'status-cancelled', 
              bay: bay.name || `Bay ${bay.id.split('-')[1]}`
            });
          }
        }
      }
      
      // Optionally, permanent OOS representation? The user just wanted Maintenance explicitly highlighted on dates, but we can do a generic one if needed. Let's keep it simple and fulfill the requested Maintenance block.
    }

    // Sort combined chronological
    dynamicBookings.sort((a, b) => {
       const timeA = a.time.split(' - ')[0];
       const timeB = b.time.split(' - ')[0];
       return timeA.localeCompare(timeB);
    });

    return dynamicBookings;
  };

  const selectedBookings = selectedDate !== null ? getBookingsForDate(selectedDate) : [];

  return (
    <div className="admin-calendar-layout">
      <AdminSidebar />

      <main className="calendar-main-content">
        <AdminHeader searchPlaceholder="Search appointments, vehicles..." />

        <div className="calendar-content-wrapper">
          
          <div className="calendar-left-section">
            <div className="calendar-header-toolbar">
              <h2>Service Calendar</h2>
              
              <div className="calendar-controls">
                <div className="nav-controls">
                  <button className="nav-arrow" onClick={() => setCurrentDateParam(new Date(year, monthIndex - 1, 1))}>&lt;</button>
                  <span className="nav-today" onClick={() => setCurrentDateParam(new Date())}>Today</span>
                  <button className="nav-arrow" onClick={() => setCurrentDateParam(new Date(year, monthIndex + 1, 1))}>&gt;</button>
                </div>

                <div className="month-selector">
                  <button className="month-btn">
                    {monthName} {year}
                    <svg fill="currentColor" viewBox="0 0 24 24"><path d="M7 10l5 5 5-5H7z"/></svg>
                  </button>
                </div>

                <div className="view-toggles">
                  <button className="view-toggle">Day</button>
                  <button className="view-toggle">Week</button>
                  <button className="view-toggle active">Month</button>
                </div>

                <button className="filters-btn">
                  <svg fill="currentColor" viewBox="0 0 24 24"><path d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z"/></svg>
                  Filters
                </button>
                <button 
                  className="btn-dark" 
                  style={{marginLeft: '10px'}}
                  onClick={() => setIsBayManagerOpen(true)}
                >
                  Manage Service Bays
                </button>
              </div>
            </div>

            <div className="calendar-grid-card">
              <div className="calendar-weekdays">
                <span>SUN</span><span>MON</span><span>TUE</span><span>WED</span><span>THU</span><span>FRI</span><span>SAT</span>
              </div>
              <div className="calendar-days-grid">
                {calendarDays.map((calDay, idx) => {
                  const isFaded = calDay.isPrevMonth || calDay.isNextMonth;
                  const isSelected = !isFaded && calDay.fullDateStr === selectedDate;
                  const dateBookings = !isFaded ? getBookingsForDate(calDay.fullDateStr) : [];
                  const hasBookings = dateBookings.length > 0;
                  const itemClass = `calendar-day-cell ${isFaded ? 'faded' : ''} ${isSelected ? 'selected' : ''}`;
                  
                  return (
                    <div 
                      key={idx} 
                      className={itemClass}
                      onClick={() => !isFaded && handleDateClick(calDay.fullDateStr)}
                    >
                      <div className="day-number">
                        {calDay.day}
                        {calDay.isToday && <div className="today-indicator"></div>}
                      </div>

                      {hasBookings && (() => {
                        const isFull = dateBookings.length >= 8; // approx 4 bays * couple books
                        
                        return (
                          <div className={`calendar-dot-indicator ${isFull ? 'full-capacity' : ''}`}>
                            <span className="dot" style={isFull ? { backgroundColor: '#E11D48' } : {}}></span>
                            <span className="dot-count" style={isFull ? { color: '#E11D48', fontWeight: 'bold' } : {}}>
                              {isFull ? 'FULL' : `${dateBookings.length} ${dateBookings.length > 1 ? 'bookings' : 'booking'}`}
                            </span>
                          </div>
                        );
                      })()}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {isSchedulePanelOpen && selectedBookings.length > 0 && (
            <div className="calendar-side-panel">
              <div className="side-panel-header">
                <div className="side-panel-header-top">
                  <span className="schedule-subtitle">SELECTED SCHEDULE</span>
                  <button className="close-panel-btn" onClick={closePanel} aria-label="Close panel">
                    <svg fill="currentColor" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
                  </button>
                </div>
                <h2 className="schedule-date">{selectedDate}</h2>
              </div>
              
              <div className="schedule-list">
                {selectedBookings.map(event => (
                  <div className="schedule-card" key={event.id}>
                    <div className={`card-accent-line ${event.statusClass}`}></div>
                    
                    <div className="card-top-row">
                       <div className={`card-time-pill ${event.statusClass}`}>
                        {event.time}
                      </div>
                      <button className="card-menu-btn">
                        <svg fill="currentColor" viewBox="0 0 24 24"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>
                      </button>
                    </div>
                    
                    <div className="card-vehicle">{event.vehicle}</div>
                    <div className="card-customer">{event.customer}</div>
                    <div className="card-service">{event.service}</div>
                    
                    <div className="card-footer-b">
                      <div className={`card-status-pill ${event.statusClass}`}>
                        {event.status}
                      </div>
                      <div className="card-bay">{event.bay}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="side-panel-actions">
                <button className="print-btn">
                   <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
                   Print Daily
                </button>
              </div>
            </div>
          )}
        </div>

        {toastMessage && (
          <div className="calendar-toast">
            {toastMessage}
          </div>
        )}

        {isBayManagerOpen && (
          <BayManagerModal 
            bays={bays}
            setBays={setBays}
            onClose={() => setIsBayManagerOpen(false)}
            localBookings={localBookings}
            updateLocalBookings={updateLocalBookings}
            showToast={showToast}
          />
        )}
      </main>
    </div>
  );
}
