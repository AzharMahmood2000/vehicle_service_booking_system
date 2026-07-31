import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { resolveImagePath } from '../../utils/imageResolver';
import './AdminHeader.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const POLL_INTERVAL = 30000; // 30 seconds
const MAX_DROPDOWN_ITEMS = 6;

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffSec = Math.floor((now - then) / 1000);
  if (diffSec < 60) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} min ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr} hr ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay === 1) return 'Yesterday';
  return `${diffDay} days ago`;
}

export default function AdminHeader({ searchPlaceholder = "Search vehicle or booking ID..." }) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [profile, setProfile] = useState({});

  // Notification state
  const [notifications, setNotifications] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [notifLoading, setNotifLoading] = useState(false);
  const [notifError, setNotifError] = useState(false);
  const [authFailed, setAuthFailed] = useState(false);

  const profileRef = useRef(null);
  const notifRef = useRef(null);
  const pollingRef = useRef(null);
  const isFetchingRef = useRef(false);
  const location = useLocation();
  const navigate = useNavigate();

  const getToken = () =>
    localStorage.getItem('vehiclecare_admin_token') ||
    sessionStorage.getItem('vehiclecare_admin_token');

  const fetchLocalProfile = () => {
    let currentData = {
      fullName: 'Admin',
      role: 'SYSTEM ADMIN',
      profileImage: ''
    };
    const adminStr = localStorage.getItem('vehiclecare_admin') || sessionStorage.getItem('vehiclecare_admin');
    if (adminStr) {
      try {
        const storedAdmin = JSON.parse(adminStr);
        currentData.fullName = storedAdmin.name || currentData.fullName;
        currentData.profileImage = storedAdmin.profileImage || '';
      } catch (e) {}
    }
    return currentData;
  };

  useEffect(() => {
    setProfile(fetchLocalProfile());
  }, []);

  useEffect(() => {
    setIsProfileOpen(false);
    setIsNotifOpen(false);
    setProfile(fetchLocalProfile());
  }, [location.pathname]);

  // Close dropdowns on click outside or Escape key
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setIsProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setIsNotifOpen(false);
      }
    };

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setIsProfileOpen(false);
        setIsNotifOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  // Fetch real notification data from existing APIs
  const fetchNotifications = useCallback(async () => {
    if (isFetchingRef.current || authFailed) return;
    isFetchingRef.current = true;

    const token = getToken();
    if (!token) {
      isFetchingRef.current = false;
      return;
    }

    const headers = { 'Authorization': `Bearer ${token}` };

    try {
      const [bookingsRes, contactRes] = await Promise.all([
        fetch(`${API_BASE_URL}/bookings`, { headers }),
        fetch(`${API_BASE_URL}/contact`, { headers })
      ]);

      // Handle 401 on either endpoint — stop polling
      if (bookingsRes.status === 401 || contactRes.status === 401) {
        setAuthFailed(true);
        isFetchingRef.current = false;
        return;
      }

      const bookingsData = await bookingsRes.json();
      const contactData = await contactRes.json();

      const items = [];

      // Pending bookings
      if (bookingsData.success && bookingsData.bookings) {
        const pending = bookingsData.bookings.filter(b => b.status === 'REQUEST PENDING');
        pending.forEach(b => {
          const serviceTitle = b.serviceId?.title || b.serviceName || 'Service';
          items.push({
            id: b._id,
            type: 'booking',
            isRead: !!b.adminNotificationRead,
            title: 'New booking request',
            subtitle: `${b.referenceNumber} • ${b.customerName}`,
            detail: `${serviceTitle} • ${b.startTime}`,
            createdAt: b.createdAt,
            target: `/admin/bookings?ref=${encodeURIComponent(b.referenceNumber)}`,
            markReadEndpoint: `/bookings/${b._id}/notification-read`
          });
        });
      }

      // Pending contact requests
      if (contactData.success && contactData.contactRequests) {
        const pending = contactData.contactRequests.filter(c => c.status === 'PENDING');
        pending.forEach(c => {
          items.push({
            id: c._id,
            type: 'contact',
            isRead: !!c.adminNotificationRead,
            title: 'New contact request',
            subtitle: c.name,
            detail: c.message ? (c.message.length > 60 ? c.message.substring(0, 60) + '...' : c.message) : '',
            createdAt: c.createdAt,
            target: `/admin/requests?id=${encodeURIComponent(c._id)}`,
            markReadEndpoint: `/contact/${c._id}/notification-read`
          });
        });
      }

      // Sort newest first
      items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      // Calculate badge based on UNREAD items ONLY
      const unreadCount = items.filter(i => !i.isRead).length;

      setTotalCount(unreadCount);
      setNotifications(items.slice(0, MAX_DROPDOWN_ITEMS));
      setNotifError(false);
    } catch (err) {
      // Keep previous state on network error
      setNotifError(true);
    } finally {
      isFetchingRef.current = false;
    }
  }, [authFailed]);

  // Initial load + polling
  useEffect(() => {
    fetchNotifications();

    pollingRef.current = setInterval(() => {
      if (!authFailed) fetchNotifications();
    }, POLL_INTERVAL);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [fetchNotifications, authFailed]);

  // Refresh on visibility change (tab becomes active)
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && !authFailed) {
        fetchNotifications();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [fetchNotifications, authFailed]);

  // Refresh when bell is opened
  const handleBellClick = () => {
    setIsNotifOpen(prev => {
      const opening = !prev;
      if (opening) fetchNotifications();
      return opening;
    });
    setIsProfileOpen(false);
  };

  const handleNotifClick = async (notif) => {
    // If not read, mark as read
    if (!notif.isRead) {
      try {
        const token = getToken();
        if (token) {
          const res = await fetch(`${API_BASE_URL}${notif.markReadEndpoint}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          });
          if (res.ok) {
            // Update local state immediately
            setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, isRead: true } : n));
            setTotalCount(prev => Math.max(0, prev - 1));
          }
        }
      } catch (err) {
        console.error("Failed to mark notification read", err);
      }
    }
    
    setIsNotifOpen(false);
    navigate(notif.target);
  };

  const handleLogout = () => {
    setIsProfileOpen(false);
    navigate('/admin-login');
  };

  const badgeText = totalCount > 99 ? '99+' : totalCount > 0 ? totalCount : null;

  // Count by type for section headers
  const bookingNotifs = notifications.filter(n => n.type === 'booking');
  const contactNotifs = notifications.filter(n => n.type === 'contact');

  return (
    <header className="admin-header">
      <div className="admin-header-search-bar">
        <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
        <input type="text" placeholder={searchPlaceholder} />
      </div>
      
      <div className="admin-header-actions">
        
        {/* Notification Bell */}
        <div className="admin-header-icon-container" ref={notifRef}>
          <button
            type="button"
            className="admin-header-icon-btn admin-header-bell-btn"
            onClick={handleBellClick}
            aria-label="Notifications"
            aria-expanded={isNotifOpen}
          >
            <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
            {badgeText && (
              <span className="admin-header-notif-badge-count">{badgeText}</span>
            )}
          </button>

          {isNotifOpen && (
            <div className="admin-header-notification-dropdown">
              <div className="admin-header-notif-header">
                <h4>Notifications</h4>
                {totalCount > 0 && (
                  <span className="admin-header-notif-total-badge">{totalCount}</span>
                )}
              </div>
              
              <div className="admin-header-notif-list">
                {notifications.length === 0 && !notifError ? (
                  <div className="admin-header-notif-empty">
                    <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" style={{width: 32, height: 32, color: '#726B7A', marginBottom: 8}}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    <span className="admin-header-notif-empty-title">You're all caught up.</span>
                    <span className="admin-header-notif-empty-desc">No pending booking requests or new contact messages.</span>
                  </div>
                ) : (
                  <>
                    {notifError && (
                      <div style={{padding: '10px 24px', fontSize: '12px', color: '#EF4444', textAlign: 'center'}}>Unable to refresh notifications.</div>
                    )}

                    {bookingNotifs.length > 0 && (
                      <>
                        <div className="admin-header-notif-section-label">BOOKINGS</div>
                        {bookingNotifs.map(n => (
                          <button key={n.id} className={`admin-header-notif-item ${!n.isRead ? 'unread' : ''}`} onClick={() => handleNotifClick(n)}>
                            <div className="admin-header-notif-icon bg-purple">
                              <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                            </div>
                            <div className="admin-header-notif-content">
                              <div className="admin-header-notif-title-row">
                                <span className={`admin-header-notif-title ${n.isRead ? 'read-title' : ''}`}>{n.title}</span>
                                {!n.isRead && <span className="admin-header-unread-dot"></span>}
                              </div>
                              <p className="admin-header-notif-desc">{n.subtitle}</p>
                              {n.detail && <p className="admin-header-notif-desc" style={{opacity: 0.7}}>{n.detail}</p>}
                              <span className="admin-header-notif-time">{timeAgo(n.createdAt)}</span>
                            </div>
                          </button>
                        ))}
                      </>
                    )}

                    {contactNotifs.length > 0 && (
                      <>
                        <div className="admin-header-notif-section-label">CONTACT REQUESTS</div>
                        {contactNotifs.map(n => (
                          <button key={n.id} className={`admin-header-notif-item ${!n.isRead ? 'unread' : ''}`} onClick={() => handleNotifClick(n)}>
                            <div className="admin-header-notif-icon bg-teal">
                              <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                            </div>
                            <div className="admin-header-notif-content">
                              <div className="admin-header-notif-title-row">
                                <span className={`admin-header-notif-title ${n.isRead ? 'read-title' : ''}`}>{n.title}</span>
                                {!n.isRead && <span className="admin-header-unread-dot"></span>}
                              </div>
                              <p className="admin-header-notif-desc">{n.subtitle}</p>
                              {n.detail && <p className="admin-header-notif-desc" style={{opacity: 0.7, fontStyle: 'italic'}}>"{n.detail}"</p>}
                              <span className="admin-header-notif-time">{timeAgo(n.createdAt)}</span>
                            </div>
                          </button>
                        ))}
                      </>
                    )}
                  </>
                )}
              </div>
              
              <div className="admin-header-notif-footer">
                <button className="admin-header-notif-footer-btn" onClick={() => { setIsNotifOpen(false); navigate('/admin/bookings'); }}>
                  View All Bookings
                </button>
                <button className="admin-header-notif-footer-btn" onClick={() => { setIsNotifOpen(false); navigate('/admin/requests'); }}>
                  View Contact Requests
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Help Icon */}
        <button type="button" className="admin-header-icon-btn">
          <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        </button>
        
        {/* Profile Dropdown */}
        <div className="admin-header-profile-wrapper" ref={profileRef}>
          <button
            type="button"
            className="admin-header-profile-trigger"
            onClick={() => { setIsProfileOpen(prev => !prev); setIsNotifOpen(false); }}
          >
            <div className="admin-header-user-info">
              <span className="admin-header-user-name">{profile.fullName}</span>
              <span className="admin-header-user-role">{profile.role}</span>
            </div>
            <div className="admin-header-user-avatar">
              <img src={resolveImagePath(profile.profileImage || '/assets/images/profile vector.png')} alt="Admin" />
            </div>
          </button>

          {isProfileOpen && (
            <div className="admin-header-profile-dropdown">
              <div className="admin-header-dropdown-header">
                <img src={resolveImagePath(profile.profileImage || '/assets/images/profile vector.png')} alt="Admin" className="admin-header-dropdown-avatar" />
                <span className="admin-header-dropdown-name">{profile.fullName}</span>
                <span className="admin-header-dropdown-role">{profile.role}</span>
              </div>
              <div className="admin-header-dropdown-divider"></div>
              
              <button className="admin-header-dropdown-item" onClick={() => { setIsProfileOpen(false); navigate('/admin/profile'); }}>
                <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                View Profile
              </button>
              
              <button className="admin-header-dropdown-item logout" onClick={handleLogout}>
                <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
