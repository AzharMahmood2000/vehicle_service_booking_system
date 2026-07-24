import React, { useState, useEffect, useRef } from 'react';
import AdminSidebar from '../../Components/AdminSidebar/AdminSidebar';
import AdminHeader from '../../Components/AdminHeader/AdminHeader';
import './AdminContactRequests.css';

const mockRequests = [
  { 
    id: 'REQ-2026-0125', 
    name: 'Kasun Anjana', 
    initials: 'JD', 
    phone: '077-2345657', 
    email: 'kasun@gmail.com', 
    messagePreview: 'Looking for a premium detailin...', 
    fullMessage: '"Hello VehicleCare team, I recently purchased a BMW X5 and am looking for a professional ceramic coating and interior detailing package. I\'d like to know if you offer pick-and-drop service in the Jubilee Hills area? Please call me to discuss the pricing and available slots for this weekend."', 
    received: 'Today, 10:24 AM', 
    status: 'NEW', 
    statusClass: 'status-new',
    avatarBg: '#3B3549'
  },
  { 
    id: 'REQ-2026-0124', 
    name: 'Tharindu', 
    initials: 'MK', 
    phone: '076-8976876', 
    email: 'Not Provided', 
    messagePreview: 'I need an urgent oil change be...',
    fullMessage: 'I need an urgent oil change before my road trip.', 
    received: 'Yesterday, 4:45 PM', 
    status: 'READ', 
    statusClass: 'status-read',
    avatarBg: '#3B3549' 
  },
  { 
    id: 'REQ-2026-0120', 
    name: 'Keshan', 
    initials: 'SC', 
    phone: '076-8909876', 
    email: 'keshan@gmail.com', 
    messagePreview: 'Enquiring about corporate flee...', 
    fullMessage: 'Enquiring about corporate fleet services for 5 vehicles.',
    received: '12 Jan, 2026', 
    status: 'CONTACTED', 
    statusClass: 'status-contacted',
    avatarBg: '#3B3549' 
  },
  { 
    id: 'REQ-2026-0115', 
    name: 'Robert', 
    initials: 'RM', 
    phone: '076-09345654', 
    email: 'robert.m@company.com', 
    messagePreview: 'Thank you for the quick quote.',
    fullMessage: 'Thank you for the quick quote. I will book the appointment.', 
    received: '10 Jan, 2026', 
    status: 'RESOLVED', 
    statusClass: 'status-resolved',
    avatarBg: '#1A4736' 
  }
];

export default function AdminContactRequests() {
  const [requests, setRequests] = useState(() => {
    const stored = localStorage.getItem('vehiclecare_contact_requests');
    if (stored) {
      try { return JSON.parse(stored); } catch(e) {}
    }
    localStorage.setItem('vehiclecare_contact_requests', JSON.stringify(mockRequests));
    window.dispatchEvent(new Event('contact_requests_updated'));
    return mockRequests;
  });
  const [selectedRequest, setSelectedRequest] = useState(null);

  useEffect(() => {
    localStorage.setItem('vehiclecare_contact_requests', JSON.stringify(requests));
    window.dispatchEvent(new Event('contact_requests_updated'));
  }, [requests]);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const statusMenuRef = useRef(null);

  // Close Three-dot status menu on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (statusMenuRef.current && !statusMenuRef.current.contains(e.target)) {
        setStatusDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle body scroll locking and Escape key for modal
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') closeDetails();
    };

    if (selectedRequest) {
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', handleEscape);
    } else {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleEscape);
    }

    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleEscape);
    };
  }, [selectedRequest]);

  const openDetails = (req) => {
    if (req.status === 'NEW') {
      handleStatusUpdate(req.id, 'READ');
      setSelectedRequest({ ...req, status: 'READ', statusClass: 'status-read' });
    } else {
      setSelectedRequest(req);
    }
    setStatusDropdownOpen(false);
  };

  const closeDetails = () => {
    setSelectedRequest(null);
    setStatusDropdownOpen(false);
  };

  const handleOverlayClick = (e) => {
    if (e.target.classList.contains('contact-request-overlay')) {
      closeDetails();
    }
  };

  const handleStatusUpdate = (requestId, newStatus) => {
    const statusClassMap = {
      'NEW': 'status-new',
      'READ': 'status-read',
      'CONTACTED': 'status-contacted',
      'RESOLVED': 'status-resolved'
    };
    
    setRequests(prevRequests => {
      const updated = prevRequests.map(req => {
        if (req.id === requestId) {
          const updatedReq = { ...req, status: newStatus, statusClass: statusClassMap[newStatus] };
          // If the currently selected request is the one being updated, update the detailed view as well
          if (selectedRequest && selectedRequest.id === requestId) {
            setSelectedRequest(updatedReq);
          }
          return updatedReq;
        }
        return req;
      });
      return updated;
    });
    setStatusDropdownOpen(false);
  };

  const totalRequestsCount = requests.length; // For realistic counts we use the dynamic array size
  const newRequestsCount = requests.filter(r => r.status === 'NEW').length;
  const readRequestsCount = requests.filter(r => r.status === 'READ').length;
  const contactedRequestsCount = requests.filter(r => r.status === 'CONTACTED').length;
  const resolvedRequestsCount = requests.filter(r => r.status === 'RESOLVED').length;

  return (
    <div className="admin-requests-layout">
      <AdminSidebar />
      
      <main className="requests-main-content">
        <AdminHeader searchPlaceholder="Search requests..." />

        <div className="requests-scroll-area">
          <div className="requests-header-section">
            <h1>Contact Requests</h1>
            <p>View and manage customer inquiries submitted through the VehicleCare contact form.</p>
          </div>

          <div className="requests-summary-cards">
            <div className="summary-stat-card border-white">
              <span className="stat-label">TOTAL REQUESTS</span>
              <span className="stat-value">{totalRequestsCount}</span>
            </div>
            <div className="summary-stat-card border-yellow">
              <span className="stat-label">NEW REQUESTS</span>
              <span className="stat-value text-yellow">{newRequestsCount}</span>
            </div>
            <div className="summary-stat-card border-pink">
              <span className="stat-label">READ</span>
              <span className="stat-value text-pink">{readRequestsCount}</span>
            </div>
            <div className="summary-stat-card border-blue">
              <span className="stat-label">CONTACTED</span>
              <span className="stat-value text-blue">{contactedRequestsCount}</span>
            </div>
            <div className="summary-stat-card border-green">
              <span className="stat-label">RESOLVED</span>
              <span className="stat-value text-green">{resolvedRequestsCount}</span>
            </div>
          </div>

          <div className="requests-table-card">
            <div className="requests-tabs">
              <button className="req-tab active">All Requests</button>
              <button className="req-tab">New</button>
              <button className="req-tab">Read</button>
              <button className="req-tab">Contacted</button>
              <button className="req-tab">Resolved</button>
            </div>

            <div className="requests-filters-bar">
              <div className="filter-item search-filter">
                <label>SEARCH</label>
                <div className="filter-input-wrap">
                  <input type="text" placeholder="Name or Mobile Number..." />
                </div>
              </div>
              <div className="filter-item date-filter">
                <label>DATE RANGE</label>
                <div className="filter-input-wrap">
                  <input type="date" placeholder="mm/dd/yyyy" />
                </div>
              </div>
              <div className="filter-item status-filter">
                <label>STATUS</label>
                <div className="filter-input-wrap">
                  <select>
                    <option>All Statuses</option>
                    <option>New</option>
                    <option>Read</option>
                    <option>Contacted</option>
                    <option>Resolved</option>
                  </select>
                </div>
              </div>
              <div className="filter-actions">
                <button className="apply-btn">Apply Filters</button>
                <button className="clear-btn">Clear</button>
              </div>
            </div>

            <div className="requests-table-container">
              <table className="req-table">
                <thead>
                  <tr>
                    <th>REQUEST ID</th>
                    <th>CUSTOMER NAME</th>
                    <th>CONTACT INFO</th>
                    <th>MESSAGE PREVIEW</th>
                    <th>RECEIVED</th>
                    <th>STATUS</th>
                    <th>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map(req => (
                    <tr key={req.id}>
                      <td className="req-id">{req.id}</td>
                      <td>
                        <div className="customer-cell">
                          <div className="customer-avatar" style={{ backgroundColor: req.avatarBg }}>{req.initials}</div>
                          <span className="customer-name-bold">{req.name}</span>
                        </div>
                      </td>
                      <td>
                        <div className="contact-info-cell">
                          <span className="c-phone">{req.phone}</span>
                          <span className="c-email">{req.email}</span>
                        </div>
                      </td>
                      <td className="msg-preview">{req.messagePreview}</td>
                      <td className="req-received">{req.received}</td>
                      <td>
                        <div className={`req-status-badge contact-status-badge ${req.statusClass}`}>
                          {req.status}
                        </div>
                      </td>
                      <td>
                        <button className="action-eye-btn" onClick={() => openDetails(req)}>
                          <svg fill="currentColor" viewBox="0 0 24 24"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="requests-pagination">
              <div className="pagination-info">SHOWING {requests.length > 0 ? '1' : '0'}-{requests.length} OF {requests.length} REQUESTS</div>
              <div className="pagination-pages">
                <button className="page-nav prev">&lt;</button>
                <button className="page-nav curr">1</button>
                <button className="page-nav next">&gt;</button>
              </div>
            </div>
          </div>
          
        </div>
      </main>

      {/* Centered Modal for Request Details */}
      {selectedRequest && (
        <div className="contact-request-overlay" onClick={handleOverlayClick}>
          <div className="contact-request-modal">
            <div className="modal-header">
              <div className="modal-title-area">
                <h2>Contact Request Details</h2>
                <span className="modal-req-id">{selectedRequest.id}</span>
              </div>
              <button className="close-modal-btn" onClick={closeDetails}>
                <svg fill="currentColor" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
              </button>
            </div>

            <div className="modal-content-scroll">
              <div className="modal-meta-row flex-wrap-gap">
                <div className="status-update-wrapper" ref={statusMenuRef}>
                  <div className={`panel-status-badge contact-status-badge ${selectedRequest.statusClass}`}>
                    <span className="dot"></span> {selectedRequest.status}
                  </div>
                  <button className="three-dot-btn" onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}>
                    <svg fill="currentColor" viewBox="0 0 24 24"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>
                  </button>
                  
                  {statusDropdownOpen && (
                    <div className="status-dropdown-menu">
                      {['NEW', 'READ', 'CONTACTED', 'RESOLVED'].map(status => (
                        <button 
                          key={status} 
                          className={`status-dropdown-item ${selectedRequest.status === status ? 'active' : ''}`}
                          onClick={() => handleStatusUpdate(selectedRequest.id, status)}
                        >
                          <span style={{ flex: 1 }}>{status}</span>
                          {selectedRequest.status === status && (
                            <svg fill="currentColor" viewBox="0 0 24 24" style={{ width: '14px', height: '14px' }}>
                              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"></path>
                            </svg>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="panel-time">
                  <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  Received: {selectedRequest.received.split(',')[1]?.trim() || selectedRequest.received}
                </div>
              </div>

              <div className="modal-body-grid">
                <div className="modal-col-left">
                  <div className="panel-section">
                    <h4 className="section-title">CUSTOMER INFORMATION</h4>
                    <div className="info-list">
                      <div className="info-item">
                        <div className="info-icon">
                          <svg fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                        </div>
                        <div className="info-text">
                          <div className="info-label">Full Name</div>
                          <div className="info-value">{selectedRequest.name}</div>
                        </div>
                      </div>
                      <div className="info-item">
                        <div className="info-icon">
                          <svg fill="currentColor" viewBox="0 0 24 24"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>
                        </div>
                        <div className="info-text">
                          <div className="info-label">Mobile Number</div>
                          <div className="info-value">{selectedRequest.phone}</div>
                        </div>
                      </div>
                      <div className="info-item">
                        <div className="info-icon">
                          <svg fill="currentColor" viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
                        </div>
                        <div className="info-text">
                          <div className="info-label">Email Address</div>
                          <div className="info-value">{selectedRequest.email}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="panel-section">
                    <h4 className="section-title">QUICK CONTACT ACTIONS</h4>
                    <div className="quick-actions-row">
                      <button className="action-box action-call">
                        <svg fill="currentColor" viewBox="0 0 24 24"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>
                        Call
                      </button>
                      <button className="action-box action-email">
                        <svg fill="currentColor" viewBox="0 0 24 24"><path d="M22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6zm-2 0l-8 5-8-5h16zm0 12H4V8l8 5 8-5v10z"/></svg>
                        Email
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="modal-col-right">
                  <div className="panel-section">
                    <h4 className="section-title">CUSTOMER MESSAGE</h4>
                    <div className="message-box">
                      {selectedRequest.fullMessage}
                    </div>
                  </div>

                  <div className="panel-section pb-40">
                    <h4 className="section-title">INTERNAL NOTES</h4>
                    <textarea placeholder="Add a private note about this request..." className="internal-notes-input"></textarea>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
