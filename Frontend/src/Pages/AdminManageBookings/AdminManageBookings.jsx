import React, { useState, useRef, useCallback, useEffect } from 'react';
import AdminSidebar from '../../Components/AdminSidebar/AdminSidebar';
import AdminHeader from '../../Components/AdminHeader/AdminHeader';
import { getBookings, updateBookingStatus } from '../../utils/bookingStorage';
import { BOOKING_STATUS, BOOKING_STATUS_CONFIG } from '../../constants/bookingStatus';
import './AdminManageBookings.css';

const STATUS_LIST = [
  BOOKING_STATUS.PENDING,
  BOOKING_STATUS.APPROVED,
  BOOKING_STATUS.IN_PROGRESS,
  BOOKING_STATUS.COMPLETED,
  BOOKING_STATUS.REJECTED
];

export default function AdminManageBookings() {
  const [bookings, setBookings] = useState([]);
  const [openStatusMenu, setOpenStatusMenu] = useState(null);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, placement: 'left', arrowTop: 0 });
  const menuBtnRefs = useRef({});

  useEffect(() => {
    // Load from centralized shared storage
    setBookings(getBookings());
  }, []);

  // Close status dropdown if clicking anywhere else or pressing Escape
  useEffect(() => {
    const closeDropdown = (e) => {
      if (!e.target.closest('.status-cell') && !e.target.closest('.status-dropdown-portal')) {
        setOpenStatusMenu(null);
      }
    };
    const handleEsc = (e) => {
      if (e.key === 'Escape') setOpenStatusMenu(null);
    };
    document.addEventListener('click', closeDropdown);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('click', closeDropdown);
      document.removeEventListener('keydown', handleEsc);
    };
  }, []);

  const openDropdown = useCallback((bookingId, e) => {
    e.stopPropagation();
    if (openStatusMenu === bookingId) {
      setOpenStatusMenu(null);
      return;
    }
    const btn = menuBtnRefs.current[bookingId];
    if (btn) {
      const rect = btn.getBoundingClientRect();
      const dropdownWidth = 188; // min-width 180 + padding/border
      const dropdownHeight = 280; // approximate max height of 6 items
      const gap = 8; // gap between button and dropdown

      // Primary: open to the LEFT of the button, vertically centered
      const spaceLeft = rect.left;
      const spaceRight = window.innerWidth - rect.right;
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;

      let placement = 'left';
      let top, left, arrowTop;

      if (spaceLeft >= dropdownWidth + gap) {
        // Open to the left side, vertically centered on the button
        placement = 'left';
        left = rect.left - dropdownWidth - gap;
        top = rect.top + rect.height / 2 - dropdownHeight / 2;
        // Clamp to viewport
        if (top < 8) top = 8;
        if (top + dropdownHeight > window.innerHeight - 8) top = window.innerHeight - 8 - dropdownHeight;
        arrowTop = rect.top + rect.height / 2 - top; // arrow position relative to dropdown
      } else if (spaceRight >= dropdownWidth + gap) {
        // Open to the right side
        placement = 'right';
        left = rect.right + gap;
        top = rect.top + rect.height / 2 - dropdownHeight / 2;
        if (top < 8) top = 8;
        if (top + dropdownHeight > window.innerHeight - 8) top = window.innerHeight - 8 - dropdownHeight;
        arrowTop = rect.top + rect.height / 2 - top;
      } else if (spaceAbove >= dropdownHeight + gap && spaceBelow < dropdownHeight + gap) {
        // Open above
        placement = 'top';
        top = rect.top - dropdownHeight - gap;
        left = rect.left + rect.width / 2 - dropdownWidth / 2;
        arrowTop = 0;
      } else {
        // Open below
        placement = 'bottom';
        top = rect.bottom + gap;
        left = rect.left + rect.width / 2 - dropdownWidth / 2;
        arrowTop = 0;
      }

      // Clamp left to viewport
      if (left < 8) left = 8;
      if (left + dropdownWidth > window.innerWidth - 8) left = window.innerWidth - 8 - dropdownWidth;

      setDropdownPos({ top, left, placement, arrowTop });
    }
    setOpenStatusMenu(bookingId);
  }, [openStatusMenu]);

  const handleStatusChange = (bookingId, newStatus) => {
    if (newStatus === BOOKING_STATUS.REJECTED) {
      const confirmReject = window.confirm("Are you sure you want to reject this booking?");
      if (!confirmReject) return;
    }

    // Actually update the shared localStorage
    const updated = updateBookingStatus(bookingId, newStatus);
    setBookings(updated);
    setOpenStatusMenu(null);
  };

  const getStatusClass = (statusStr) => {
    return BOOKING_STATUS_CONFIG[statusStr]?.cssClass || 'status-req-pending';
  };

  return (
    <div className="admin-bookings-layout">
      <AdminSidebar />
      
      <main className="bookings-content">
        <AdminHeader searchPlaceholder="Search booking reference, customer, vehicle..." />

        <div className="bookings-scroll-area">
          <div className="page-heading">
            <span className="operations-label">OPERATIONS</span>
            <h1>Manage Bookings</h1>
          </div>

          <div className="summary-cards">
            <div className="summary-card stat-total">
              <div className="icon-circle"><svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg></div>
              <div className="stat-name">Total<br/>Bookings</div>
              <div className="stat-number">{bookings.length}</div>
            </div>
            <div className="summary-card stat-pending">
              <div className="icon-circle"><svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg></div>
              <div className="stat-name">Request<br/>Pending</div>
              <div className="stat-number">{bookings.filter(b => b.status === BOOKING_STATUS.PENDING).length}</div>
            </div>
            <div className="summary-card stat-approved">
              <div className="icon-circle"><svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg></div>
              <div className="stat-name">Approved</div>
              <div className="stat-number">{bookings.filter(b => b.status === BOOKING_STATUS.APPROVED).length}</div>
            </div>
            <div className="summary-card stat-progress">
              <div className="icon-circle"><svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg></div>
              <div className="stat-name">In Progress</div>
              <div className="stat-number">{bookings.filter(b => b.status === BOOKING_STATUS.IN_PROGRESS).length}</div>
            </div>
            <div className="summary-card stat-completed">
              <div className="icon-circle"><svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg></div>
              <div className="stat-name">Completed</div>
              <div className="stat-number">{bookings.filter(b => b.status === BOOKING_STATUS.COMPLETED).length}</div>
            </div>
          </div>

          <div className="bookings-main-card">
            <div className="bookings-tabs">
              <button className="tab active">All Bookings</button>
              <button className="tab">Request Pending</button>
              <button className="tab">Approved</button>
              <button className="tab">In Progress</button>
              <button className="tab">Completed</button>
            </div>

            <div className="bookings-filters">
              <div className="filter-group">
                <label>REFERENCE</label>
                <input type="text" placeholder="VSB-XXXX" />
              </div>
              <div className="filter-group">
                <label>CUSTOMER</label>
                <input type="text" placeholder="Name or email" />
              </div>
              <div className="filter-group">
                <label>VEHICLE</label>
                <input type="text" placeholder="Plate number" />
              </div>
              <div className="filter-group">
                <label>STATUS</label>
                <select>
                  <option>All Statuses</option>
                  <option>Request Pending</option>
                  <option>Approved</option>
                  <option>In Progress</option>
                  <option>Completed</option>
                  <option>Rejected</option>
                </select>
              </div>
            </div>

            <div className="bookings-table-wrapper">
              <table className="bookings-table">
                <thead>
                  <tr>
                    <th>REF ID</th>
                    <th>VEHICLE</th>
                    <th>CUSTOMER</th>
                    <th>SERVICE & TIME</th>
                    <th className="status-header-center">STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking) => (
                    <tr key={booking.referenceNumber || booking.id} className={openStatusMenu === (booking.referenceNumber || booking.id) ? 'menu-open' : ''}>
                      <td><strong>{booking.referenceNumber || booking.id}</strong></td>
                      <td>
                        <span className="plate-badge yellow-plate">{booking.numberPlate}</span>
                        <div className="vehicle-table-name">{booking.vehicleModel}</div>
                      </td>
                      <td>
                        <div className="person-name">{booking.customerName}</div>
                        <div className="person-phone">{booking.phoneNumber}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: '#0F0519' }}>{booking.serviceName}</div>
                        <div style={{ fontSize: '13px', color: '#6A5C7A', marginTop: '4px' }}>
                          📅 {booking.appointmentDate} | ⏰ {booking.startTime}
                        </div>
                        <div style={{ fontSize: '11px', color: '#FF1493', marginTop: '2px', fontWeight: 600 }}>
                           Bay {(booking.serviceBay || '').split('-')[1]}
                        </div>
                      </td>
                      <td>
                        <div className="status-cell">
                          <div className="status-badge-wrapper">
                            <span className={`status-pill ${getStatusClass(booking.status)}`}>{booking.status}</span>
                          </div>
                          <button 
                            className="status-menu-btn"
                            ref={(el) => (menuBtnRefs.current[booking.referenceNumber || booking.id] = el)}
                            onClick={(e) => openDropdown(booking.referenceNumber || booking.id, e)}
                          >
                            <svg fill="currentColor" viewBox="0 0 24 24"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"></path></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {bookings.length === 0 && (
                     <tr>
                        <td colSpan="5" style={{textAlign: 'center', padding: '40px 0', color: '#6A5C7A'}}>
                           No bookings found.
                        </td>
                     </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Portal-style fixed dropdown rendered outside the table */}
            {openStatusMenu && (() => {
              const booking = bookings.find(b => (b.referenceNumber || b.id) === openStatusMenu);
              if (!booking) return null;
              return (
                <div
                  className={`status-dropdown-portal placement-${dropdownPos.placement}`}
                  style={{
                    position: 'fixed',
                    top: `${dropdownPos.top}px`,
                    left: `${dropdownPos.left}px`,
                    zIndex: 99999,
                  }}
                >
                  {/* Caret arrow pointing toward the three-dot button */}
                  <div
                    className={`dropdown-caret caret-${dropdownPos.placement}`}
                    style={(
                      dropdownPos.placement === 'left' || dropdownPos.placement === 'right'
                    ) ? { top: `${dropdownPos.arrowTop}px` } : {}}
                  />
                  <div className="status-dropdown-fixed">
                    {STATUS_LIST.map((statusKey) => (
                      <div
                        key={statusKey}
                        className={`status-dropdown-item ${booking.status === statusKey ? 'active' : ''}`}
                        onClick={() => handleStatusChange(booking.referenceNumber || booking.id, statusKey)}
                      >
                        <span style={{ flex: 1 }}>{BOOKING_STATUS_CONFIG[statusKey]?.label || statusKey}</span>
                        {booking.status === statusKey && (
                          <svg fill="currentColor" viewBox="0 0 24 24" style={{ width: '14px', height: '14px' }}>
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"></path>
                          </svg>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

            <div className="bookings-pagination">
              <div className="page-info">Showing 1 to {Math.min(10, bookings.length)} of {bookings.length} entries</div>
              <div className="page-controls">
                <button className="page-btn page-arrow">&lt;</button>
                <button className="page-btn page-num active">1</button>
                <button className="page-btn page-arrow">&gt;</button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
