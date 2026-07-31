import React, { useState, useRef, useCallback, useEffect } from 'react';
import AdminSidebar from '../../Components/AdminSidebar/AdminSidebar';
import AdminHeader from '../../Components/AdminHeader/AdminHeader';
// Important: do NOT remove the bookingStorage file, but we remove the imports for it.
import API_BASE_URL from '../../api';
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
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState(null);

  const [activeTab, setActiveTab] = useState('All Bookings');
  const [filters, setFilters] = useState({
    reference: '',
    customer: '',
    vehicle: '',
    status: 'All Statuses'
  });

  const [openStatusMenu, setOpenStatusMenu] = useState(null);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, placement: 'left', arrowTop: 0 });
  const menuBtnRefs = useRef({});

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setIsLoading(true);
    setApiError(null);
    try {
      const token = localStorage.getItem('vehiclecare_admin_token') || sessionStorage.getItem('vehiclecare_admin_token');
      if (!token) {
        setApiError("Authentication required.");
        setIsLoading(false);
        return;
      }

      const res = await fetch(`${API_BASE_URL}/bookings`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || "Failed to load bookings.");
      }

      setBookings(data.bookings || []);
    } catch (err) {
      console.error("Booking fetch error:", err);
      setApiError("Unable to load bookings. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

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

  const handleStatusChange = async (bookingId, newStatus) => {
    if (newStatus === BOOKING_STATUS.REJECTED) {
      const confirmReject = window.confirm("Are you sure you want to reject this booking?");
      if (!confirmReject) return;
    }

    try {
      const token = localStorage.getItem('vehiclecare_admin_token') || sessionStorage.getItem('vehiclecare_admin_token');
      if (!token) {
        setApiError("Authentication required.");
        return;
      }
      
      const res = await fetch(`${API_BASE_URL}/bookings/${bookingId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || "Failed to update booking status.");
      }

      setBookings(prev => prev.map(b => b._id === bookingId ? data.booking : b));
      setOpenStatusMenu(null);
    } catch (err) {
      console.error("Status update error:", err);
      // fallback logging without alerting immediately on API error, requirement says: show/log the backend message, do not pretend it succeeded
    }
  };

  const getStatusClass = (statusStr) => {
    return BOOKING_STATUS_CONFIG[statusStr]?.cssClass || 'status-req-pending';
  };

  const handleFilterChange = (e, field) => {
    setFilters(prev => ({ ...prev, [field]: e.target.value }));
  };

  const filteredBookings = bookings.filter(b => {
    // Tab filter
    if (activeTab === 'Request Pending' && b.status !== BOOKING_STATUS.PENDING) return false;
    if (activeTab === 'Approved' && b.status !== BOOKING_STATUS.APPROVED) return false;
    if (activeTab === 'In Progress' && b.status !== BOOKING_STATUS.IN_PROGRESS) return false;
    if (activeTab === 'Completed' && b.status !== BOOKING_STATUS.COMPLETED) return false;

    // Search filters
    if (filters.reference && !(b.referenceNumber || '').toLowerCase().includes(filters.reference.toLowerCase())) return false;
    if (filters.customer && 
        !((b.customerName || '').toLowerCase().includes(filters.customer.toLowerCase()) || 
          (b.phoneNumber || '').toLowerCase().includes(filters.customer.toLowerCase()))) return false;
    if (filters.vehicle && 
        !((b.vehicleNumber || b.numberPlate || '').toLowerCase().includes(filters.vehicle.toLowerCase()) || 
          (b.vehicleModel || '').toLowerCase().includes(filters.vehicle.toLowerCase()))) return false;
    
    if (filters.status !== 'All Statuses') {
      const statusLabelToEnum = {
        'Request Pending': BOOKING_STATUS.PENDING,
        'Approved': BOOKING_STATUS.APPROVED,
        'In Progress': BOOKING_STATUS.IN_PROGRESS,
        'Completed': BOOKING_STATUS.COMPLETED,
        'Rejected': BOOKING_STATUS.REJECTED
      };
      const targetStatus = statusLabelToEnum[filters.status];
      if (targetStatus && b.status !== targetStatus) return false;
    }
    
    return true;
  });

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
              {['All Bookings', 'Request Pending', 'Approved', 'In Progress', 'Completed'].map(tab => (
                <button 
                  key={tab}
                  className={`tab ${activeTab === tab ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="bookings-filters">
              <div className="filter-group">
                <label>REFERENCE</label>
                <input type="text" placeholder="VSB-XXXX" value={filters.reference} onChange={(e) => handleFilterChange(e, 'reference')} />
              </div>
              <div className="filter-group">
                <label>CUSTOMER</label>
                <input type="text" placeholder="Name or email" value={filters.customer} onChange={(e) => handleFilterChange(e, 'customer')} />
              </div>
              <div className="filter-group">
                <label>VEHICLE</label>
                <input type="text" placeholder="Plate number" value={filters.vehicle} onChange={(e) => handleFilterChange(e, 'vehicle')} />
              </div>
              <div className="filter-group">
                <label>STATUS</label>
                <select value={filters.status} onChange={(e) => handleFilterChange(e, 'status')}>
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
                  {!isLoading && filteredBookings.map((booking) => (
                    <tr key={booking._id} className={openStatusMenu === booking._id ? 'menu-open' : ''}>
                      <td><strong>{booking.referenceNumber}</strong></td>
                      <td>
                        <span className="plate-badge yellow-plate">{booking.vehicleNumber || booking.numberPlate}</span>
                        <div className="vehicle-table-name">{booking.vehicleModel}</div>
                      </td>
                      <td>
                        <div className="person-name">{booking.customerName}</div>
                        <div className="person-phone">{booking.phoneNumber}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: '#0F0519' }}>{booking.serviceId?.title || booking.serviceName}</div>
                        <div style={{ fontSize: '13px', color: '#6A5C7A', marginTop: '4px' }}>
                          📅 {booking.appointmentDate} | ⏰ {booking.startTime}
                        </div>
                        <div style={{ fontSize: '11px', color: '#FF1493', marginTop: '2px', fontWeight: 600 }}>
                           {booking.serviceBay?.name || (typeof booking.serviceBay === 'string' && booking.serviceBay.includes('-') ? `Bay ${booking.serviceBay.split('-')[1]}` : booking.serviceBay || '')}
                        </div>
                      </td>
                      <td>
                        <div className="status-cell">
                          <div className="status-badge-wrapper">
                            <span className={`status-pill ${getStatusClass(booking.status)}`}>{booking.status}</span>
                          </div>
                          <button 
                            className="status-menu-btn"
                            ref={(el) => (menuBtnRefs.current[booking._id] = el)}
                            onClick={(e) => openDropdown(booking._id, e)}
                          >
                            <svg fill="currentColor" viewBox="0 0 24 24"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"></path></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {isLoading && (
                     <tr>
                        <td colSpan="5" style={{textAlign: 'center', padding: '40px 0', color: '#6A5C7A'}}>
                           Loading bookings...
                        </td>
                     </tr>
                  )}
                  {!isLoading && apiError && (
                     <tr>
                        <td colSpan="5" style={{textAlign: 'center', padding: '40px 0', color: '#e74c3c'}}>
                           {apiError}
                        </td>
                     </tr>
                  )}
                  {!isLoading && !apiError && bookings.length > 0 && filteredBookings.length === 0 && (
                     <tr>
                        <td colSpan="5" style={{textAlign: 'center', padding: '40px 0', color: '#6A5C7A'}}>
                           No bookings match the selected filters.
                        </td>
                     </tr>
                  )}
                  {!isLoading && !apiError && bookings.length === 0 && (
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
              const booking = bookings.find(b => b._id === openStatusMenu);
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
                        onClick={() => handleStatusChange(booking._id, statusKey)}
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
              <div className="page-info">Showing {filteredBookings.length > 0 ? 1 : 0} to {Math.min(10, filteredBookings.length)} of {filteredBookings.length} entries</div>
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
