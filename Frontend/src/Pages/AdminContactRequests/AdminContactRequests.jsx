import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import AdminSidebar from '../../Components/AdminSidebar/AdminSidebar';
import AdminHeader from '../../Components/AdminHeader/AdminHeader';
import API_BASE_URL from '../../api';
import './AdminContactRequests.css';

export default function AdminContactRequests() {
  const [searchParams] = useSearchParams();
  const targetId = searchParams.get('id');
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedRequest, setSelectedRequest] = useState(null);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const statusMenuRef = useRef(null);

  const getToken = () => localStorage.getItem('vehiclecare_admin_token') || sessionStorage.getItem('vehiclecare_admin_token');

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = getToken();
      if (!token) throw new Error("401"); // No token

      const res = await fetch(`${API_BASE_URL}/contact`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();

      if (res.status === 401) throw new Error("401");
      if (!res.ok || !data.success) throw new Error(data.message || 'Unable to load contact requests.');

      // Set requests, backend already sorts by createdAt descending.
      setRequests(data.contactRequests || []);
    } catch (err) {
      if (err.message === "401") {
        setError("Your session has expired. Please log in again.");
      } else {
        setError("Unable to load contact requests.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const [highlightedRequest, setHighlightedRequest] = useState(null);

  // Deep linking logic
  useEffect(() => {
    if (!loading && requests.length > 0 && targetId) {
      const match = requests.find(r => r._id === targetId);
      if (match) {
        setSelectedRequest(match);
        setTimeout(() => {
          const el = document.getElementById(`contact-row-${targetId}`);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setHighlightedRequest(targetId);
            setTimeout(() => setHighlightedRequest(null), 3000);
          }
        }, 100);
      }
    }
  }, [loading, requests.length, targetId]);

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
      if (e.key === 'Escape' && !isUpdating) closeDetails();
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
  }, [selectedRequest, isUpdating]);

  const openDetails = (req) => {
    setSelectedRequest(req);
    setStatusDropdownOpen(false);
  };

  const closeDetails = () => {
    if (isUpdating) return;
    setSelectedRequest(null);
    setStatusDropdownOpen(false);
  };

  const handleOverlayClick = (e) => {
    if (e.target.classList.contains('contact-request-overlay') && !isUpdating) {
      closeDetails();
    }
  };

  const handleStatusUpdate = async (requestId, newStatus) => {
    try {
      setIsUpdating(true);
      const token = getToken();
      const res = await fetch(`${API_BASE_URL}/contact/${requestId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      
      if (!res.ok || !data.success) {
        alert(data.message || 'Failed to update status');
        return;
      }

      // Update locally
      setRequests(prev => prev.map(r => r._id === requestId ? { ...r, status: newStatus } : r));
      if (selectedRequest && selectedRequest._id === requestId) {
        setSelectedRequest({ ...selectedRequest, status: newStatus });
      }
      setStatusDropdownOpen(false);
      window.dispatchEvent(new Event('contact_requests_updated'));
    } catch (err) {
      alert('Network error when updating status.');
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusClass = (status) => {
    if (status === 'PENDING') return 'status-new';
    if (status === 'CONTACTED') return 'status-contacted';
    if (status === 'RESOLVED') return 'status-resolved';
    return '';
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const day = d.getDate().toString().padStart(2, '0');
    const month = d.toLocaleString('en-US', { month: 'short' });
    const year = d.getFullYear();
    const time = d.toLocaleString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    return `${day} ${month} ${year}, ${time}`;
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    const split = name.trim().split(' ');
    if (split.length >= 2) return (split[0][0] + split[1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };
  
  const getAvatarBg = (name) => {
    const bgs = ['#3B3549', '#1A4736', '#4A2A2A', '#1F3A4D'];
    if (!name) return bgs[0];
    const hash = name.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    return bgs[hash % bgs.length];
  };

  const totalRequestsCount = requests.length;
  const pendingRequestsCount = requests.filter(r => r.status === 'PENDING').length;
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

          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#6B7280' }}>Loading contact requests...</div>
          ) : error ? (
             <div style={{ padding: '40px', textAlign: 'center', color: '#EF4444' }}>{error}</div>
          ) : (
            <>
              <div className="requests-summary-cards">
                <div className="summary-stat-card border-white">
                  <span className="stat-label">TOTAL REQUESTS</span>
                  <span className="stat-value">{totalRequestsCount}</span>
                </div>
                <div className="summary-stat-card border-yellow">
                  <span className="stat-label">PENDING</span>
                  <span className="stat-value text-yellow">{pendingRequestsCount}</span>
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
                  <button className="req-tab">Pending</button>
                  <button className="req-tab">Contacted</button>
                  <button className="req-tab">Resolved</button>
                </div>

                <div className="requests-table-container">
                  <table className="req-table">
                    <thead>
                      <tr>
                        <th>CUSTOMER NAME</th>
                        <th>CONTACT INFO</th>
                        <th>MESSAGE PREVIEW</th>
                        <th>RECEIVED</th>
                        <th>STATUS</th>
                        <th>ACTION</th>
                      </tr>
                    </thead>
                    <tbody>
                      {requests.length === 0 ? (
                        <tr>
                          <td colSpan="6" style={{textAlign: 'center', padding: '40px', color: '#6B7280'}}>No contact requests yet.</td>
                        </tr>
                      ) : (
                        requests.map(req => (
                          <tr 
                            key={req._id}
                            id={`contact-row-${req._id}`}
                            className={highlightedRequest === req._id ? 'highlight-row' : ''}
                          >
                            <td>
                              <div className="customer-cell">
                                <div className="customer-avatar" style={{ backgroundColor: getAvatarBg(req.name) }}>
                                  {getInitials(req.name)}
                                </div>
                                <span className="customer-name-bold">{req.name}</span>
                              </div>
                            </td>
                            <td>
                              <div className="contact-info-cell">
                                <span className="c-phone">{req.phone}</span>
                                <span className="c-email">{req.email}</span>
                              </div>
                            </td>
                            <td className="msg-preview">{req.message?.substring(0, 30) + '...'}</td>
                            <td className="req-received">{formatDate(req.createdAt)}</td>
                            <td>
                              <div className={`req-status-badge contact-status-badge ${getStatusClass(req.status)}`}>
                                {req.status}
                              </div>
                            </td>
                            <td>
                              <button className="action-eye-btn" onClick={() => openDetails(req)}>
                                <svg fill="currentColor" viewBox="0 0 24 24"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

              </div>
            </>
          )}
          
        </div>
      </main>

      {/* Centered Modal for Request Details */}
      {selectedRequest && (
        <div className="contact-request-overlay" onClick={handleOverlayClick}>
          <div className="contact-request-modal">
            <div className="modal-header">
              <div className="modal-title-area">
                <h2>Contact Request Details</h2>
              </div>
              <button className="close-modal-btn" onClick={closeDetails} disabled={isUpdating}>
                <svg fill="currentColor" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
              </button>
            </div>

            <div className="modal-content-scroll">
              <div className="modal-meta-row flex-wrap-gap">
                <div className="status-update-wrapper" ref={statusMenuRef}>
                  <div className={`panel-status-badge contact-status-badge ${getStatusClass(selectedRequest.status)}`}>
                    <span className="dot"></span> {selectedRequest.status}
                  </div>
                  <button className="three-dot-btn" onClick={() => setStatusDropdownOpen(!statusDropdownOpen)} disabled={isUpdating}>
                    <svg fill="currentColor" viewBox="0 0 24 24"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>
                  </button>
                  
                  {statusDropdownOpen && !isUpdating && (
                    <div className="status-dropdown-menu">
                      {['PENDING', 'CONTACTED', 'RESOLVED'].map(status => (
                        <button 
                          key={status} 
                          className={`status-dropdown-item ${selectedRequest.status === status ? 'active' : ''}`}
                          onClick={() => handleStatusUpdate(selectedRequest._id, status)}
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
                  Received: {formatDate(selectedRequest.createdAt)}
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
                          <div className="info-value">
                            <a href={`tel:${selectedRequest.phone}`} className="info-link" style={{color: '#fff', textDecoration: 'none'}}>{selectedRequest.phone}</a>
                          </div>
                        </div>
                      </div>
                      <div className="info-item">
                        <div className="info-icon">
                          <svg fill="currentColor" viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
                        </div>
                        <div className="info-text">
                          <div className="info-label">Email Address</div>
                          <div className="info-value">
                            <a href={`mailto:${selectedRequest.email}`} className="info-link" style={{color: '#fff', textDecoration: 'none'}}>{selectedRequest.email}</a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="panel-section">
                    <h4 className="section-title">QUICK CONTACT ACTIONS</h4>
                    <div className="quick-actions-row">
                      <a href={`tel:${selectedRequest.phone}`} className="action-box action-call" style={{textDecoration: 'none'}}>
                        <svg fill="currentColor" viewBox="0 0 24 24"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>
                        Call
                      </a>
                      <a href={`mailto:${selectedRequest.email}`} className="action-box action-email" style={{textDecoration: 'none'}}>
                        <svg fill="currentColor" viewBox="0 0 24 24"><path d="M22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6zm-2 0l-8 5-8-5h16zm0 12H4V8l8 5 8-5v10z"/></svg>
                        Email
                      </a>
                    </div>
                  </div>
                </div>
                
                <div className="modal-col-right">
                  <div className="panel-section">
                    <h4 className="section-title">CUSTOMER MESSAGE</h4>
                    <div className="message-box">
                      {selectedRequest.message}
                    </div>
                  </div>

                  <div className="panel-section pb-40">
                    <h4 className="section-title">UPDATE STATUS</h4>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button 
                        className="btn-submit" 
                        onClick={() => handleStatusUpdate(selectedRequest._id, 'RESOLVED')}
                        disabled={isUpdating || selectedRequest.status === 'RESOLVED'}
                        style={{ padding: '10px 16px', background: selectedRequest.status === 'RESOLVED' ? '#374151' : '#10B981', color: '#fff', borderRadius: '8px', border: 'none', cursor: selectedRequest.status === 'RESOLVED' ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}
                      >
                        {isUpdating ? 'Updating...' : 'Mark as Resolved'}
                      </button>
                    </div>
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
