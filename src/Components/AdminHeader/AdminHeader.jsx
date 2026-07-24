import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './AdminHeader.css';

export default function AdminHeader({ searchPlaceholder = "Search vehicle or booking ID..." }) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [profile, setProfile] = useState({});

  const profileRef = useRef(null);
  const notifRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Fetch initial profile
  useEffect(() => {
    import('../../utils/adminProfileStorage').then(({ getAdminProfile }) => {
      setProfile(getAdminProfile());
    });
  }, []);

  // Close dropdowns on route change
  useEffect(() => {
    setIsProfileOpen(false);
    setIsNotifOpen(false);
    
    // We can also passively re-fetch profile on route change to keep it fresh
    import('../../utils/adminProfileStorage').then(({ getAdminProfile }) => {
      setProfile(getAdminProfile());
    });
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

  const handleLogout = () => {
    setIsProfileOpen(false);
    navigate('/admin-login');
  };

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
            className="admin-header-icon-btn"
            onClick={() => { setIsNotifOpen(prev => !prev); setIsProfileOpen(false); }}
          >
            <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
            <span className="admin-header-notif-badge"></span>
          </button>

          {isNotifOpen && (
            <div className="admin-header-notification-dropdown">
              <div className="admin-header-notif-header">
                <h4>Notifications</h4>
                <button className="admin-header-mark-read-btn">MARK ALL AS READ</button>
              </div>
              
              <div className="admin-header-notif-list">
                <div className="admin-header-notif-item unread">
                  <div className="admin-header-notif-icon bg-purple">
                    <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                  </div>
                  <div className="admin-header-notif-content">
                    <div className="admin-header-notif-title-row">
                      <span className="admin-header-notif-title">New booking request received</span>
                      <span className="admin-header-unread-dot"></span>
                    </div>
                    <p className="admin-header-notif-desc">Ferrari Roma - Full Detailing & Ceramic Coating request from Julian M.</p>
                    <span className="admin-header-notif-time">2 minutes ago</span>
                  </div>
                </div>
                
                <div className="admin-header-notif-item">
                  <div className="admin-header-notif-icon bg-red">
                    <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                  </div>
                  <div className="admin-header-notif-content">
                    <div className="admin-header-notif-title-row">
                      <span className="admin-header-notif-title">Appointment slot is full</span>
                    </div>
                    <p className="admin-header-notif-desc">Saturday, Oct 24th is now at 100% capacity. New requests will be waitlisted.</p>
                    <span className="admin-header-notif-time">1 hour ago</span>
                  </div>
                </div>
                
                <div className="admin-header-notif-item">
                  <div className="admin-header-notif-icon bg-olive">
                    <svg fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg>
                  </div>
                  <div className="admin-header-notif-content">
                    <div className="admin-header-notif-title-row">
                      <span className="admin-header-notif-title">Service completed</span>
                    </div>
                    <p className="admin-header-notif-desc">Maintenance check for Porsche 911 (B-772) is finished and ready for pickup.</p>
                    <span className="admin-header-notif-time">3 hours ago</span>
                  </div>
                </div>
              </div>
              
              <button className="admin-header-notif-footer-btn">See all history</button>
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
              <img src={profile.profileImage} alt="Admin" />
            </div>
          </button>

          {isProfileOpen && (
            <div className="admin-header-profile-dropdown">
              <div className="admin-header-dropdown-header">
                <img src={profile.profileImage} alt="Admin" className="admin-header-dropdown-avatar" />
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
