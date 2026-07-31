import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../Components/AdminSidebar/AdminSidebar';
import AdminHeader from '../../Components/AdminHeader/AdminHeader';
// Important: do NOT use bookingStorage for local data
import API_BASE_URL from '../../api';
import { BOOKING_STATUS } from '../../constants/bookingStatus';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, inProgress: 0, completed: 0 });
  const [todayBookings, setTodayBookings] = useState([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [bays, setBays] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    setApiError(null);
    try {
      const token = localStorage.getItem('vehiclecare_admin_token') || sessionStorage.getItem('vehiclecare_admin_token');
      if (!token) {
        setApiError("Authentication required. Please log in.");
        setIsLoading(false);
        return;
      }
      
      const config = { headers: { 'Authorization': `Bearer ${token}` } };
      
      const [summaryRes, bookingsRes, baysRes] = await Promise.all([
        fetch(`${API_BASE_URL}/dashboard/summary`, config),
        fetch(`${API_BASE_URL}/bookings`, config),
        fetch(`${API_BASE_URL}/bays`, config).catch(() => null)
      ]);
      
      if (!summaryRes || !summaryRes.ok) {
        throw new Error("Failed to load dashboard summary.");
      }
      if (!bookingsRes || !bookingsRes.ok) {
        throw new Error("Failed to load bookings.");
      }
      
      let baysData = { bays: [] };
      if (baysRes && baysRes.ok) {
        try {
          baysData = await baysRes.json();
        } catch (e) {
          console.error("Failed to parse bays:", e);
        }
      }

      const summaryData = await summaryRes.json();
      const bookingsData = await bookingsRes.json();

      if (summaryData.bookingStats) {
        setStats({
          total: summaryData.bookingStats.total || 0,
          pending: summaryData.bookingStats.requestPending || 0,
          approved: summaryData.bookingStats.approved || 0,
          inProgress: summaryData.bookingStats.inProgress || 0,
          completed: summaryData.bookingStats.completed || 0,
        });
      }

      const allBookings = bookingsData.bookings || [];
      const today = new Date();
      const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      
      const tBookings = allBookings.filter(b => b.appointmentDate === todayStr);
      setTodayBookings(tBookings);

      const uBookings = allBookings.filter(b => b.appointmentDate > todayStr);
      uBookings.sort((a, b) => {
        if (a.appointmentDate === b.appointmentDate) {
          return (a.startTime || '').localeCompare(b.startTime || '');
        }
        return (a.appointmentDate || '').localeCompare(b.appointmentDate || '');
      });
      setUpcomingAppointments(uBookings.slice(0, 3));
      
      setBays(baysData.bays || []);
    } catch (err) {
      console.error(err);
      setApiError("Unable to load dashboard data.");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadgeClass = (statusStr) => {
    const s = String(statusStr || '').toUpperCase();
    if (s === 'REQUEST PENDING' || s === 'PENDING') return 'badge-pending';
    if (s === 'APPROVED') return 'badge-approved';
    if (s === 'IN PROGRESS') return 'badge-progress';
    if (s === 'COMPLETED') return 'badge-completed';
    if (s === 'REJECTED') return 'badge-rejected';
    if (s === 'CANCELLED') return 'badge-cancelled';
    return 'badge-pending';
  };

  const activeBaysCount = bays.filter(b => b.active).length;

  return (
    <div className="admin-dashboard-layout">
      <AdminSidebar />
      
      <main className="dashboard-content">
        <AdminHeader searchPlaceholder="Search vehicle or booking ID..." />

        <div className="dashboard-scroll-area">
          
          {apiError && (
             <div style={{color: '#ff4d4f', padding: '10px 20px', background: 'rgba(255,0,0,0.1)', borderRadius: '8px', marginBottom: '20px'}}>
               {apiError}
             </div>
          )}

          {isLoading ? (
            <div style={{color: '#fff', padding: '40px', textAlign: 'center'}}>
               Loading dashboard...
            </div>
          ) : (
          <>
          <div className="stats-row">
            <div className="stat-card" style={{borderLeftColor: '#A09BA5'}}>
              <div className="stat-info">
                <span className="stat-label">Total Bookings</span>
                <h3 className="stat-value">{stats.total}</h3>
                <div className="stat-trend trend-up">
                  <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
                  Calculated from records
                </div>
              </div>
              <div className="stat-icon-wrapper" style={{background: '#F8F7FA', color: '#140821'}}>
                <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{width: 20, height: 20}}><path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
              </div>
            </div>
            <div className="stat-card" style={{borderLeftColor: '#FFD700'}}>
              <div className="stat-info">
                <span className="stat-label">Pending</span>
                <h3 className="stat-value">{stats.pending}</h3>
                <div className="stat-trend trend-neutral">Requires immediate attention</div>
              </div>
              <div className="stat-icon-wrapper" style={{background: 'rgba(255,215,0,0.1)', color: '#FFD700'}}>
                <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{width: 20, height: 20}}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
              </div>
            </div>
            <div className="stat-card" style={{borderLeftColor: '#FF1493'}}>
              <div className="stat-info">
                <span className="stat-label">Approved</span>
                <h3 className="stat-value">{stats.approved}</h3>
                <div className="stat-trend trend-neutral">Scheduled for processing</div>
              </div>
              <div className="stat-icon-wrapper" style={{background: 'rgba(255,20,147,0.1)', color: '#FF1493'}}>
                <svg fill="currentColor" viewBox="0 0 24 24" style={{width: 20, height: 20}}><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2zm-1.127 15.353l-4.226-4.225 1.414-1.414 2.812 2.811 5.922-5.922 1.414 1.414-7.336 7.336z"></path></svg>
              </div>
            </div>
            <div className="stat-card" style={{borderLeftColor: '#3B82F6'}}>
              <div className="stat-info">
                <span className="stat-label">In Progress</span>
                <h3 className="stat-value">{stats.inProgress}</h3>
                <div className="stat-trend trend-neutral">Currently servicing</div>
              </div>
              <div className="stat-icon-wrapper" style={{background: 'rgba(59,130,246,0.1)', color: '#3B82F6'}}>
                <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{width: 20, height: 20}}><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path></svg>
              </div>
            </div>
            <div className="stat-card" style={{borderLeftColor: '#140821'}}>
              <div className="stat-info">
                <span className="stat-label">Completed</span>
                <h3 className="stat-value">{stats.completed}</h3>
                <div className="stat-trend trend-neutral">Services finalized</div>
              </div>
              <div className="stat-icon-wrapper" style={{background: '#F8F7FA', color: '#140821'}}>
                <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{width: 20, height: 20}}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </div>
            </div>
          </div>

          <div className="job-board-panel">
            <div className="job-board-header">
              <div className="job-board-title">
                <svg fill="currentColor" viewBox="0 0 24 24"><path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.5 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.8.8 2.1.8 2.9 0l.8-.8c.8-.8.8-2 0-2.9z"></path></svg>
                <h2>Today's Job Board</h2>
              </div>
              <div className="job-board-actions">
                <button className="btn-outline">EXPORT PDF</button>
                <button className="btn-dark">FILTERS</button>
              </div>
            </div>
            
            <table className="job-table">
              <thead>
                <tr>
                  <th>NUMBER PLATE</th>
                  <th>VEHICLE MODEL</th>
                  <th>CUSTOMER</th>
                  <th>SERVICE & BAY</th>
                  <th>TIME SLOT</th>
                  <th>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {todayBookings.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{textAlign: 'center', padding: '30px', color: '#A09BA5'}}>
                       No bookings scheduled for today.
                    </td>
                  </tr>
                ) : (
                  todayBookings.map(booking => {
                    const plate = booking.vehicleNumber || booking.numberPlate || 'N/A';
                    const model = booking.vehicleModel || 'Unknown';
                    const serviceTitle = booking.serviceId?.title || booking.serviceName || 'Service';
                    const bayName = booking.serviceBay?.name || (typeof booking.serviceBay === 'string' && booking.serviceBay.includes('-') ? `Bay ${booking.serviceBay.split('-')[1]}` : booking.serviceBay || '');

                    return (
                      <tr key={booking._id}>
                        <td>
                          <div className="number-plate-badge">{plate}</div>
                        </td>
                        <td>
                          <div className="vehicle-name">{model}</div>
                        </td>
                        <td>
                          <div className="customer-name">{booking.customerName}</div>
                          <div className="customer-phone">{booking.phoneNumber}</div>
                        </td>
                        <td>
                          <div className="service-name">{serviceTitle}</div>
                          {bayName && <div style={{fontSize: '11px', color:'#FF1493', marginTop: '4px', fontWeight: 600}}>{bayName}</div>}
                        </td>
                        <td>
                          <div className="time-slot"><svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> {booking.startTime} {booking.endTime ? `- ${booking.endTime}` : ''}</div>
                        </td>
                        <td><span className={`badge ${getStatusBadgeClass(booking.status)}`}>{booking.status}</span></td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="dashboard-bottom-grid">
            {/* Live Workshop View mapped to truthful operational metrics */}
            <div className="live-workshop-card">
              <div className="workshop-header">
                <h3>Live<br/>Workshop<br/>View</h3>
                <div className="bay-status" style={{color: '#140821', background: 'rgba(0,0,0,0.05)', padding: '4px 8px', borderRadius: '4px'}}>
                  REALTIME
                </div>
              </div>
              <div className="video-placeholder" style={{flexDirection: 'column', color: '#140821'}}>
                <div style={{fontSize: '28px', fontWeight: 800}}>{activeBaysCount}</div>
                <div style={{fontSize: '11px', fontWeight: 700}}>Active Bays</div>
              </div>
              <div className="workshop-footer">
                <div>IN PROGRESS:<br/>{stats.inProgress} Bookings</div>
                <div>APPROVED:<br/>{stats.approved} Bookings</div>
              </div>
            </div>

            {/* Hiding the fake efficiency analytics and replacing with an empty flex placeholder to preserve layout if 3-column grid is required, or replacing with real metrics if desired. Let's just repurpose the card to display booking flow. */}
            <div className="efficiency-card">
              <div className="eff-block">
                <div className="eff-title">Completion Rate</div>
                <div className="eff-value">{stats.total > 0 ? Math.round((stats.completed / (stats.total || 1)) * 100) : 0}%</div>
                <div className="eff-bar-label">
                  <span>Based on all tasks</span>
                  <span className="text-pink">Dynamic</span>
                </div>
                <div className="progress-bg"><div className="progress-fill pink" style={{width: `${stats.total > 0 ? Math.round((stats.completed / (stats.total || 1)) * 100) : 0}%`}}></div></div>
              </div>
              
              <div className="eff-block">
                <div className="eff-bar-label">
                  <span style={{color: '#fff'}}>Pending Requests</span>
                  <span className="text-yellow">{stats.pending}</span>
                </div>
                <div className="progress-bg"><div className="progress-fill yellow" style={{width: `${stats.total > 0 ? Math.round((stats.pending / (stats.total || 1)) * 100) : 0}%`}}></div></div>
              </div>

              <button className="btn-outline-glow">REFRESH DASHBOARD</button>
            </div>

            <div className="upcoming-appointments-card">
              <h3>Upcoming<br/>Appointments</h3>
              <div className="appointment-list">
                {upcomingAppointments.length === 0 ? (
                  <div style={{color: '#A09BA5', fontSize: '13px'}}>No upcoming appointments.</div>
                ) : (
                  upcomingAppointments.map((appt, i) => {
                    const dateObj = new Date(appt.appointmentDate);
                    const month = dateObj.toLocaleString('default', { month: 'short' });
                    const day = dateObj.getDate();
                    return (
                      <div className="appt-item" key={appt._id}>
                        <div className={`appt-date ${i===2 ? 'pink-date' : ''}`}><span>{month}</span><strong>{day}</strong></div>
                        <div className="appt-details">
                          <h4>{appt.vehicleModel || appt.vehicleNumber}</h4>
                          <p>{appt.startTime} - {appt.serviceId?.title || appt.serviceName || 'Service'}</p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
              {/* Removed fake static workshop chart entirely since backend does not provide workshop hourly load data */}
            </div>
          </div>
          </>
          )}

        </div>
      </main>
    </div>
  );
}
