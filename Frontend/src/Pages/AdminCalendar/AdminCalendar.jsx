import React, { useState, useEffect, useRef } from 'react';
import AdminSidebar from '../../Components/AdminSidebar/AdminSidebar';
import AdminHeader from '../../Components/AdminHeader/AdminHeader';
import API_BASE_URL from '../../api';
import { BOOKING_STATUS_CONFIG } from '../../constants/bookingStatus';
import { SERVICE_BAY_STATUS } from '../../constants/serviceBayStatus';
import BayManagerModal from '../../Components/BayManagerModal/BayManagerModal';
import './AdminCalendar.css';

export default function AdminCalendar() {
  const [selectedDate, setSelectedDate] = useState(null);
  const [isSchedulePanelOpen, setIsSchedulePanelOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  
  const [calendarBookings, setCalendarBookings] = useState([]);
  const [maintenances, setMaintenances] = useState([]);
  const [bays, setBays] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState(null);

  const [currentDateParam, setCurrentDateParam] = useState(new Date());
  const [activeView, setActiveView] = useState('month'); // 'day', 'week', 'month'

  const formatLocalDate = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };
  
  // Popover States
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [datePickerYear, setDatePickerYear] = useState(currentDateParam.getFullYear());
  
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    status: 'All',
    service: 'All',
    bay: 'All',
    eventType: 'All'
  });
  const [tempFilters, setTempFilters] = useState(filters);
  const activeFiltersCount = Object.values(filters).filter(v => v !== 'All').length;

  // Bay Manager States
  const [isBayManagerOpen, setIsBayManagerOpen] = useState(false);

  const year = currentDateParam.getFullYear();
  const monthName = currentDateParam.toLocaleString('default', { month: 'long' });
  const monthIndex = currentDateParam.getMonth();

  // We only fetch data once per month interval. So if navigating within same month, we don't refetch
  useEffect(() => {
    fetchCalendarData(year, monthIndex);
  }, [year, monthIndex]);

  const fetchCalendarData = async (y, m) => {
    setIsLoading(true);
    setApiError(null);
    try {
      const token = sessionStorage.getItem('vehiclecare_admin_token') || localStorage.getItem('vehiclecare_admin_token');
      if (!token) {
        setApiError("Authentication required.");
        setIsLoading(false);
        return;
      }

      const config = { headers: { 'Authorization': `Bearer ${token}` } };
      
      const firstDay = new Date(y, m, 1);
      const startDayOfWeek = firstDay.getDay(); 
      const gridStart = new Date(y, m, 1 - startDayOfWeek);
      const startStr = formatLocalDate(gridStart);
      
      // Fetch generously up to 45 days safely covering all views seamlessly
      const gridEnd = new Date(y, m, 1 - startDayOfWeek + 42);
      const endStr = formatLocalDate(gridEnd);
      
      const [bookingsRes, baysRes, maintRes] = await Promise.all([
        fetch(`${API_BASE_URL}/calendar/bookings?startDate=${startStr}&endDate=${endStr}`, config),
        fetch(`${API_BASE_URL}/bays`, config),
        fetch(`${API_BASE_URL}/maintenance`, config).catch(() => null)
      ]);

      if (!bookingsRes.ok) throw new Error("Failed to load calendar data.");
      if (!baysRes.ok) throw new Error("Failed to load service bays.");

      const bData = await bookingsRes.json();
      const baysData = await baysRes.json();
      let mData = { maintenances: [] };
      if (maintRes && maintRes.ok) {
        mData = await maintRes.json();
      }

      setCalendarBookings(bData.bookings || []);
      setBays(baysData.bays || []);
      setMaintenances(mData.maintenances || []);
    } catch (err) {
      console.error(err);
      setApiError("Unable to load calendar data.");
    } finally {
      setIsLoading(false);
    }
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleDateClick = (dayStr) => {
    const events = getBookingsForDate(dayStr);
    setSelectedDate(dayStr);
    
    // Crucial: Anchor currentDateParam exactly to selectedDate so Day/Week views seamlessly track it
    const [yStr, mStr, dStr] = dayStr.split('-');
    setCurrentDateParam(new Date(Number(yStr), Number(mStr) - 1, Number(dStr)));

    if (events.length > 0) {
      setIsSchedulePanelOpen(true);
      setToastMessage('');
    } else {
      setIsSchedulePanelOpen(false);
      showToast("No bookings scheduled for this date.");
    }
  };

  const handleEventClick = (event, e) => {
    e.stopPropagation(); // prevent bubbling to day click
    setSelectedDate(event.dateFull);
    setIsSchedulePanelOpen(true);
  };

  const closePanel = () => {
    setIsSchedulePanelOpen(false);
    setSelectedDate(null);
  };

  const handleViewChange = (viewName) => {
    if (selectedDate) {
      const [sy, sm, sd] = selectedDate.split('-');
      setCurrentDateParam(new Date(Number(sy), Number(sm) - 1, Number(sd)));
    }
    setActiveView(viewName);
  };

  // Extract unique services from loaded bookings to populate filter dropdown dynamically
  const availableServices = Array.from(new Set(calendarBookings.map(b => b.serviceId?.title || b.serviceName).filter(Boolean)));

  const getBookingsForDate = (dateStringFull) => {
    if (!dateStringFull) return [];
    
    const dynamicBookings = calendarBookings
      .filter(b => b.appointmentDate === dateStringFull)
      .map(b => ({
        id: b._id,
        dateFull: dateStringFull,
        time: `${b.startTime} - ${b.endTime || ''}`,
        vehicle: b.vehicleNumber || b.numberPlate,
        customer: b.customerName,
        service: b.serviceId?.title || b.serviceName,
        status: BOOKING_STATUS_CONFIG[b.status]?.label || b.status,
        statusId: b.status,
        statusClass: BOOKING_STATUS_CONFIG[b.status]?.cssClass || 'status-req-pending',
        bay: b.serviceBay?.name || (typeof b.serviceBay === 'string' && b.serviceBay.includes('-') ? `Bay ${b.serviceBay.split('-')[1]}` : b.serviceBay || 'TBD'),
        type: 'booking'
      }));

    const maintBookings = maintenances
      .filter(m => m.maintenanceDate === dateStringFull && m.active)
      .map(m => ({
        id: m._id,
        dateFull: dateStringFull,
        time: `${m.startTime} - ${m.endTime}`,
        vehicle: 'Maintenance',
        customer: 'Internal',
        service: m.reason || 'Routine Maintenance',
        status: 'Maintenance',
        statusId: 'Maintenance',
        statusClass: 'status-cancelled',
        bay: m.serviceBay?.name || 'TBD',
        type: 'maintenance'
      }));

    let combined = [...dynamicBookings, ...maintBookings];

    if (filters.status !== 'All') combined = combined.filter(e => e.statusId === filters.status);
    if (filters.service !== 'All') combined = combined.filter(e => e.service === filters.service);
    if (filters.bay !== 'All') combined = combined.filter(e => e.bay === filters.bay || e.bay === `Bay ${filters.bay}`);
    
    if (filters.eventType === 'Bookings') combined = combined.filter(e => e.type === 'booking');
    if (filters.eventType === 'Maintenance') combined = combined.filter(e => e.type === 'maintenance');

    combined.sort((a, b) => {
       const timeA = a.time.split(' - ')[0];
       const timeB = b.time.split(' - ')[0];
       return timeA.localeCompare(timeB);
    });

    return combined;
  };

  // Navigations
  const handlePrev = () => {
    if (activeView === 'month') {
      setCurrentDateParam(new Date(currentDateParam.getFullYear(), currentDateParam.getMonth() - 1, 1));
    } else if (activeView === 'week') {
      setCurrentDateParam(new Date(currentDateParam.getFullYear(), currentDateParam.getMonth(), currentDateParam.getDate() - 7));
    } else if (activeView === 'day') {
      const newD = new Date(currentDateParam.getFullYear(), currentDateParam.getMonth(), currentDateParam.getDate() - 1);
      setCurrentDateParam(newD);
      setSelectedDate(formatLocalDate(newD));
    }
  };

  const handleNext = () => {
    if (activeView === 'month') {
      setCurrentDateParam(new Date(currentDateParam.getFullYear(), currentDateParam.getMonth() + 1, 1));
    } else if (activeView === 'week') {
      setCurrentDateParam(new Date(currentDateParam.getFullYear(), currentDateParam.getMonth(), currentDateParam.getDate() + 7));
    } else if (activeView === 'day') {
      const newD = new Date(currentDateParam.getFullYear(), currentDateParam.getMonth(), currentDateParam.getDate() + 1);
      setCurrentDateParam(newD);
      setSelectedDate(formatLocalDate(newD));
    }
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentDateParam(today);
    setSelectedDate(formatLocalDate(today));
  };

  // Click outside handlers
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.month-selector')) setIsDatePickerOpen(false);
      if (!e.target.closest('.filters-btn-wrapper')) setIsFilterOpen(false);
    };
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setIsDatePickerOpen(false);
        setIsFilterOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  // View Generators
  const getMonthDays = () => {
    const days = [];
    const firstDay = new Date(year, monthIndex, 1);
    const lastDay = new Date(year, monthIndex + 1, 0);
    const startDayOfWeek = firstDay.getDay(); 
    const prevMonthLastDay = new Date(year, monthIndex, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(year, monthIndex, 1 - (i + 1));
      days.push({ 
        day: prevMonthLastDay - i, 
        isPrevMonth: true, 
        fullDateStr: formatLocalDate(prevDate)
      });
    }
    const today = new Date();
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const isToday = today.getDate() === i && today.getMonth() === monthIndex && today.getFullYear() === year;
      const currDate = new Date(year, monthIndex, i);
      days.push({ 
        day: i, 
        isToday, 
        fullDateStr: formatLocalDate(currDate)
      });
    }
    const remaining = 42 - days.length; 
    for (let i = 1; i <= remaining; i++) {
        const nextDate = new Date(year, monthIndex + 1, i);
        days.push({ 
          day: i, 
          isNextMonth: true,
          fullDateStr: formatLocalDate(nextDate)
        });
    }
    return days;
  };

  const getWeekDays = () => {
    const arr = [];
    const d = new Date(currentDateParam);
    const dayOfWeek = d.getDay();
    const startOfWeek = new Date(d);
    startOfWeek.setDate(d.getDate() - dayOfWeek);
    for (let i = 0; i < 7; i++) {
       const cd = new Date(startOfWeek);
       cd.setDate(startOfWeek.getDate() + i);
       arr.push({
         dayObj: cd,
         day: cd.getDate(),
         dayName: cd.toLocaleString('default', { weekday: 'short' }).toUpperCase(),
         fullDateStr: formatLocalDate(cd),
         isToday: cd.toDateString() === new Date().toDateString()
       });
    }
    return arr;
  };

  // Nav Label formatted
  const getNavLabel = () => {
    if (activeView === 'month') return `${monthName} ${year}`;
    if (activeView === 'day') return `${currentDateParam.toLocaleString('default', { weekday: 'long' })}, ${currentDateParam.getDate()} ${monthName} ${year}`;
    const wd = getWeekDays();
    const sf = wd[0].dayObj.toLocaleString('default', { month: 'short' });
    const ef = wd[6].dayObj.toLocaleString('default', { month: 'short' });
    if (sf === ef) {
      return `${wd[0].day} - ${wd[6].day} ${sf} ${wd[6].dayObj.getFullYear()}`;
    }
    return `${wd[0].day} ${sf} - ${wd[6].day} ${ef} ${year}`;
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
                <button type="button" className="today-btn" onClick={handleToday}>Today</button>

                <div className="month-selector">
                  <button type="button" className="month-btn" onClick={() => { setIsDatePickerOpen(!isDatePickerOpen); setIsFilterOpen(false); }}>
                    {getNavLabel()}
                    <svg fill="currentColor" viewBox="0 0 24 24"><path d="M7 10l5 5 5-5H7z"/></svg>
                  </button>
                  {isDatePickerOpen && (
                    <div className="date-picker-popover" onClick={e => e.stopPropagation()}>
                       <div className="dp-header">
                         <button type="button" onClick={() => setDatePickerYear(y => y - 1)}>&lt;</button>
                         <span>{datePickerYear}</span>
                         <button type="button" onClick={() => setDatePickerYear(y => y + 1)}>&gt;</button>
                       </div>
                       <div className="dp-months">
                         {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map((m, i) => (
                            <button type="button" key={m} onClick={() => {
                               setCurrentDateParam(new Date(datePickerYear, i, 1));
                               setIsDatePickerOpen(false);
                            }}>{m}</button>
                         ))}
                       </div>
                    </div>
                  )}
                </div>

                <div className="view-toggles">
                  <button type="button" className={`view-toggle ${activeView === 'day' ? 'active' : ''}`} onClick={() => handleViewChange('day')}>Day</button>
                  <button type="button" className={`view-toggle ${activeView === 'week' ? 'active' : ''}`} onClick={() => handleViewChange('week')}>Week</button>
                  <button type="button" className={`view-toggle ${activeView === 'month' ? 'active' : ''}`} onClick={() => handleViewChange('month')}>Month</button>
                </div>

                <div className="filters-btn-wrapper">
                  <button type="button" className="filters-btn" onClick={() => { setIsFilterOpen(!isFilterOpen); setIsDatePickerOpen(false); }}>
                    <svg fill="currentColor" viewBox="0 0 24 24"><path d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z"/></svg>
                    Filters
                    {activeFiltersCount > 0 && <span className="filters-badge">{activeFiltersCount}</span>}
                  </button>
                  {isFilterOpen && (
                    <div className="filters-popover" onClick={e => e.stopPropagation()}>
                       <div className="filter-group">
                         <label>Status</label>
                         <select value={tempFilters.status} onChange={e => setTempFilters({...tempFilters, status: e.target.value})}>
                           <option value="All">All Statuses</option>
                           <option value="REQUEST PENDING">Request Pending</option>
                           <option value="APPROVED">Approved</option>
                           <option value="IN PROGRESS">In Progress</option>
                           <option value="COMPLETED">Completed</option>
                           <option value="REJECTED">Rejected</option>
                           <option value="CANCELLED">Cancelled</option>
                         </select>
                       </div>
                       <div className="filter-group">
                         <label>Service</label>
                         <select value={tempFilters.service} onChange={e => setTempFilters({...tempFilters, service: e.target.value})}>
                           <option value="All">All Services</option>
                           {availableServices.map(s => <option key={s} value={s}>{s}</option>)}
                         </select>
                       </div>
                       <div className="filter-group">
                         <label>Service Bay</label>
                         <select value={tempFilters.bay} onChange={e => setTempFilters({...tempFilters, bay: e.target.value})}>
                           <option value="All">All Bays</option>
                           {bays.map(b => (
                             <option key={b._id} value={b.name}>{b.name}</option>
                           ))}
                         </select>
                       </div>
                       <div className="filter-group">
                         <label>Event Type</label>
                         <select value={tempFilters.eventType} onChange={e => setTempFilters({...tempFilters, eventType: e.target.value})}>
                           <option value="All">All Events</option>
                           <option value="Bookings">Bookings</option>
                           <option value="Maintenance">Maintenance</option>
                         </select>
                       </div>
                       <div className="filter-actions">
                         <button type="button" className="btn-reset" onClick={() => {
                           const res = { status: 'All', service: 'All', bay: 'All', eventType: 'All' };
                           setTempFilters(res);
                           setFilters(res);
                           setIsFilterOpen(false);
                         }}>Reset</button>
                         <button type="button" className="btn-apply" onClick={() => {
                           setFilters(tempFilters);
                           setIsFilterOpen(false);
                         }}>Apply Filters</button>
                       </div>
                    </div>
                  )}
                </div>
                
                <button 
                  type="button"
                  className="btn-dark" 
                  style={{marginLeft: '10px'}}
                  onClick={() => setIsBayManagerOpen(true)}
                >
                  Manage Service Bays
                </button>
              </div>
            </div>

            {apiError && (
               <div style={{color: '#ff4d4f', padding: '10px 20px', background: 'rgba(255,0,0,0.1)', borderRadius: '8px', marginBottom: '20px'}}>
                 {apiError}
               </div>
            )}

            {isLoading ? (
               <div style={{color: '#A09BA5', padding: '40px', textAlign: 'center'}}>
                 Loading calendar...
               </div>
            ) : (
              <>
                {/* MONTH VIEW */}
                {activeView === 'month' && (
                  <div className="calendar-grid-card">
                    <div className="calendar-weekdays">
                      <span>SUN</span><span>MON</span><span>TUE</span><span>WED</span><span>THU</span><span>FRI</span><span>SAT</span>
                    </div>
                    <div className="calendar-days-grid">
                      {getMonthDays().map((calDay, idx) => {
                        const isFaded = calDay.isPrevMonth || calDay.isNextMonth;
                        const isSelected = !isFaded && calDay.fullDateStr === selectedDate;
                        const dateBookings = getBookingsForDate(calDay.fullDateStr);
                        const hasBookings = dateBookings.length > 0;
                        const itemClass = `calendar-day-cell ${isFaded ? 'faded' : ''} ${isSelected ? 'selected' : ''}`;
                        
                        return (
                          <div 
                            key={idx} 
                            className={itemClass}
                            onClick={() => handleDateClick(calDay.fullDateStr)}
                          >
                            <div className="day-number">
                              {calDay.day}
                              {calDay.isToday && <div className="today-indicator"></div>}
                            </div>
                            {hasBookings && (
                              <div className="calendar-dot-indicator">
                                <span className="dot"></span>
                                <span className="dot-count">
                                  {dateBookings.length} {dateBookings.length > 1 ? 'events' : 'event'}
                                </span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* WEEK VIEW */}
                {activeView === 'week' && (
                  <div className="week-view-grid">
                    <div className="week-columns">
                      {getWeekDays().map((wDay, idx) => {
                        const dailyEvents = getBookingsForDate(wDay.fullDateStr);
                        return (
                          <div className="week-col" key={idx} onClick={() => handleDateClick(wDay.fullDateStr)}>
                            <div className={`week-header ${wDay.isToday ? 'is-today' : ''}`}>
                              <div className="day-name">{wDay.dayName}</div>
                              <div className="day-date">{wDay.day}</div>
                            </div>
                            <div className="week-events">
                              {dailyEvents.length === 0 && <div className="empty-events-msg">No events</div>}
                              {dailyEvents.map(ev => (
                                <div className={`week-event-card ${ev.statusClass}`} key={ev.id} onClick={(e) => handleEventClick(ev, e)}>
                                   <div className="time">{ev.time}</div>
                                   <div className="vehicle">{ev.vehicle}</div>
                                   <div className="service">{ev.service}</div>
                                   <div className="card-footer">
                                     <div className={`status ${ev.statusClass}`}>{ev.status}</div>
                                     <div className="bay">{ev.bay}</div>
                                   </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* DAY VIEW */}
                {activeView === 'day' && (
                  <div className="day-view-container">
                    <div className="day-view-header">
                       {currentDateParam.toLocaleString('default', { weekday: 'long' })}, {currentDateParam.getDate()} {monthName} {year}
                    </div>
                    <div className="day-view-list">
                       {(() => {
                         const cDateStr = formatLocalDate(currentDateParam);
                         const dEvents = getBookingsForDate(cDateStr);
                         if (dEvents.length === 0) {
                           return <div className="empty-day-msg">No bookings or maintenance scheduled for this date.</div>;
                         }
                         return dEvents.map(event => (
                            <div className="schedule-card" key={event.id} onClick={() => handleDateClick(cDateStr)} style={{cursor: 'pointer'}}>
                              <div className={`card-accent-line ${event.statusClass}`}></div>
                              <div className="card-top-row">
                                 <div className={`card-time-pill ${event.statusClass}`}>{event.time}</div>
                              </div>
                              <div className="card-vehicle">{event.vehicle}</div>
                              <div className="card-customer">{event.customer}</div>
                              <div className="card-service">{event.service}</div>
                              <div className="card-footer-b">
                                <div className={`card-status-pill ${event.statusClass}`}>{event.status}</div>
                                <div className="card-bay">{event.bay}</div>
                              </div>
                            </div>
                         ));
                       })()}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {isSchedulePanelOpen && selectedBookings.length > 0 && (
            <div className="calendar-side-panel">
              <div className="side-panel-header">
                <div className="side-panel-header-top">
                  <span className="schedule-subtitle">SELECTED SCHEDULE</span>
                  <button type="button" className="close-panel-btn" onClick={closePanel} aria-label="Close panel">
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
                      <button type="button" className="card-menu-btn">
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
                <button type="button" className="print-btn">
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
            onClose={() => setIsBayManagerOpen(false)}
            showToast={showToast}
            refetchBays={() => fetchCalendarData(year, monthIndex)} 
          />
        )}
      </main>
    </div>
  );
}
