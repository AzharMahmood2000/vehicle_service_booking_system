import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../Components/AdminSidebar/AdminSidebar';
import AdminHeader from '../../Components/AdminHeader/AdminHeader';
import { getBookings } from '../../utils/bookingStorage';
import { BOOKING_STATUS } from '../../constants/bookingStatus';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    setBookings(getBookings());
  }, []);

  const total = bookings.length;
  const pending = bookings.filter(b => b.status === BOOKING_STATUS.PENDING).length;
  const approved = bookings.filter(b => b.status === BOOKING_STATUS.APPROVED).length;
  const completed = bookings.filter(b => b.status === BOOKING_STATUS.COMPLETED).length;

  return (
    <div className="admin-dashboard-layout">
      <AdminSidebar />
      
      <main className="dashboard-content">
        <AdminHeader searchPlaceholder="Search vehicle or booking ID..." />

        <div className="dashboard-scroll-area">
          <div className="stats-row">
            <div className="stat-card" style={{borderLeftColor: '#A09BA5'}}>
              <div className="stat-info">
                <span className="stat-label">Total Bookings</span>
                <h3 className="stat-value">{total}</h3>
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
                <h3 className="stat-value">{pending}</h3>
                <div className="stat-trend trend-neutral">Requires immediate attention</div>
              </div>
              <div className="stat-icon-wrapper" style={{background: 'rgba(255,215,0,0.1)', color: '#FFD700'}}>
                <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{width: 20, height: 20}}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
              </div>
            </div>
            <div className="stat-card" style={{borderLeftColor: '#FF1493'}}>
              <div className="stat-info">
                <span className="stat-label">Approved</span>
                <h3 className="stat-value">{approved}</h3>
                <div className="stat-trend trend-neutral">Scheduled for processing</div>
              </div>
              <div className="stat-icon-wrapper" style={{background: 'rgba(255,20,147,0.1)', color: '#FF1493'}}>
                <svg fill="currentColor" viewBox="0 0 24 24" style={{width: 20, height: 20}}><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2zm-1.127 15.353l-4.226-4.225 1.414-1.414 2.812 2.811 5.922-5.922 1.414 1.414-7.336 7.336z"></path></svg>
              </div>
            </div>
            <div className="stat-card" style={{borderLeftColor: '#140821'}}>
              <div className="stat-info">
                <span className="stat-label">Completed</span>
                <h3 className="stat-value">{completed}</h3>
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
                  <th>SERVICE</th>
                  <th>TIME SLOT</th>
                  <th>STATUS</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <div className="number-plate-badge">FU-CH-911</div>
                  </td>
                  <td>
                    <div className="vehicle-name">Porsche 911 GT3</div>
                  </td>
                  <td>
                    <div className="customer-name">Kasun</div>
                    <div className="customer-phone">076-8989098</div>
                  </td>
                  <td>
                    <div className="service-name">Full<br/>Performance<br/>Tuning</div>
                  </td>
                  <td>
                    <div className="time-slot"><svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> 09:00 - 11:30</div>
                  </td>
                  <td><span className="badge badge-pending">PENDING</span></td>
                </tr>

                <tr>
                  <td>
                    <div className="number-plate-badge">AU-ZN-088</div>
                  </td>
                  <td>
                    <div className="vehicle-name">Mercedes S-Class</div>
                  </td>
                  <td>
                    <div className="customer-name">Pasindu</div>
                    <div className="customer-phone">076-9897875</div>
                  </td>
                  <td>
                    <div className="service-name">Interior<br/>Sanitization</div>
                  </td>
                  <td>
                    <div className="time-slot"><svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> 10:30 - 12:00</div>
                  </td>
                  <td><span className="badge badge-approved">APPROVED</span></td>
                </tr>

                <tr>
                  <td>
                    <div className="number-plate-badge">MC-LR-720</div>
                  </td>
                  <td>
                    <div className="vehicle-name">McLaren 720S</div>
                  </td>
                  <td>
                    <div className="customer-name">Nuwan</div>
                    <div className="customer-phone">076-8976564</div>
                  </td>
                  <td>
                    <div className="service-name">Brake System<br/>Flush</div>
                  </td>
                  <td>
                    <div className="time-slot"><svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> 08:00 - 10:00</div>
                  </td>
                  <td><span className="badge badge-completed">COMPLETED</span></td>
                </tr>

                <tr>
                  <td>
                    <div className="number-plate-badge">LX-US-500</div>
                  </td>
                  <td>
                    <div className="vehicle-name">Lexus LC500</div>
                  </td>
                  <td>
                    <div className="customer-name">Vasana</div>
                    <div className="customer-phone">075-7684987</div>
                  </td>
                  <td>
                    <div className="service-name">Hybrid Health<br/>Check</div>
                  </td>
                  <td>
                    <div className="time-slot"><svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> 14:00 - 15:30</div>
                  </td>
                  <td><span className="badge badge-rejected">REJECTED</span></td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="dashboard-bottom-grid">
            <div className="live-workshop-card">
              <div className="workshop-header">
                <h3>Live<br/>Workshop<br/>View</h3>
                <div className="bay-status">
                  BAY 04<br/>ACTIVE
                </div>
              </div>
              <div className="video-placeholder">
                <svg fill="currentColor" viewBox="0 0 24 24"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>
              </div>
              <div className="workshop-footer">
                <div>MECHANIC:<br/>DAVID S.</div>
                <div>Est. Completion: 18<br/>mins</div>
              </div>
            </div>

            <div className="efficiency-card">
              <div className="eff-block">
                <div className="eff-title">Service Efficiency</div>
                <div className="eff-value">94.2%</div>
                <div className="eff-bar-label">
                  <span>Average Turnaround</span>
                  <span className="text-pink">Optimal</span>
                </div>
                <div className="progress-bg"><div className="progress-fill pink" style={{width:'94%'}}></div></div>
              </div>
              
              <div className="eff-block">
                <div className="eff-bar-label">
                  <span style={{color: '#fff'}}>Parts Availability</span>
                  <span className="text-yellow">Medium</span>
                </div>
                <div className="progress-bg"><div className="progress-fill yellow" style={{width:'60%'}}></div></div>
              </div>

              <button className="btn-outline-glow">GENERATE ANALYTICS REPORT</button>
            </div>

            <div className="upcoming-appointments-card">
              <h3>Upcoming<br/>Appointments</h3>
              <div className="appointment-list">
                <div className="appt-item">
                  <div className="appt-date"><span>Oct</span><strong>24</strong></div>
                  <div className="appt-details">
                    <h4>Volvo XC90 Service</h4>
                    <p>14:00 - Regular Maintenance</p>
                  </div>
                </div>
                <div className="appt-item">
                  <div className="appt-date"><span>Oct</span><strong>24</strong></div>
                  <div className="appt-details">
                    <h4>Tesla Model S</h4>
                    <p>16:30 - Diagnostic Check</p>
                  </div>
                </div>
                <div className="appt-item">
                  <div className="appt-date pink-date"><span>Oct</span><strong>25</strong></div>
                  <div className="appt-details">
                    <h4>Audi R8 V10</h4>
                    <p>09:00 - Oil Change & Filter</p>
                  </div>
                </div>
              </div>
              <div className="workshop-chart">
                <div className="chart-label">WORKSHOP EFFICIENCY</div>
                <div className="chart-bars">
                  <div className="bar grey" style={{height: '30%'}}></div>
                  <div className="bar grey" style={{height: '50%'}}></div>
                  <div className="bar pink" style={{height: '100%'}}></div>
                  <div className="bar grey" style={{height: '40%'}}></div>
                  <div className="bar grey" style={{height: '25%'}}></div>
                  <div className="bar grey" style={{height: '15%'}}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
