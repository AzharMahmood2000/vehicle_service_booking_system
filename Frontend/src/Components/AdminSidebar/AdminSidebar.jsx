import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import CreateBookingModal from '../CreateBookingModal';
import './AdminSidebar.css';

export default function AdminSidebar() {
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  
  const [newRequestCount, setNewRequestCount] = useState(0);

  React.useEffect(() => {
    const updateCount = async () => {
      try {
        const token = localStorage.getItem('vehiclecare_admin_token') || sessionStorage.getItem('vehiclecare_admin_token');
        if (!token) return;
        const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
        const res = await fetch(`${API_BASE_URL}/contact`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok && data.success && data.contactRequests) {
          setNewRequestCount(data.contactRequests.filter((r) => r.status === 'PENDING').length);
        }
      } catch (e) {
        console.error("Failed to load request badge count", e);
      }
    };
    updateCount();
    window.addEventListener('contact_requests_updated', updateCount);
    return () => window.removeEventListener('contact_requests_updated', updateCount);
  }, []);

  const handleOpenModal = () => {
    setIsBookingModalOpen(true);
  };
  
  const handleCloseModal = () => setIsBookingModalOpen(false);

  return (
    <aside className="admin-sidebar">
      <div className="sidebar-brand">
        <div className="brand-logo">
          V
        </div>
        <div className="brand-text">
          <span className="brand-title">VehicleCare</span>
          <span className="brand-subtitle">VEHICLE SERVICE DESK</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/admin/dashboard" className="sidebar-link" activeClassName="active">
          <svg fill="currentColor" viewBox="0 0 24 24"><path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/></svg>
          Dashboard
        </NavLink>
        <NavLink to="/admin/bookings" className="sidebar-link" activeClassName="active">
          <svg fill="currentColor" viewBox="0 0 24 24"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V9h14v10zm0-12H5V5h14v2z"/></svg>
          Manage Bookings
        </NavLink>
        <NavLink to="/admin/requests" className="sidebar-link" activeClassName="active">
          <svg fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
          Contact Requests
          {newRequestCount > 0 && <span className="sidebar-badge">{newRequestCount}</span>}
        </NavLink>
        <NavLink to="/admin/calendar" className="sidebar-link" activeClassName="active">
          <svg fill="currentColor" viewBox="0 0 24 24"><path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z"/></svg>
          Calendar
        </NavLink>
        <NavLink to="/admin/categories" className="sidebar-link" activeClassName="active">
          <svg fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l-5.5 9h11L12 2zm0 3.84L13.93 9h-3.87L12 5.84zM17.5 13c-2.49 0-4.5 2.01-4.5 4.5s2.01 4.5 4.5 4.5 4.5-2.01 4.5-4.5-2.01-4.5-4.5-4.5zm0 7c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5zM3 21.5h8v-8H3v8zm2-6h4v4H5v-4z"/></svg>
          Service Categories
        </NavLink>
        <NavLink to="/admin/settings" className="sidebar-link" activeClassName="active">
          <svg fill="currentColor" viewBox="0 0 24 24"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.06-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.56-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.73 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.06.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .43-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>
          Settings
        </NavLink>
      </nav>

      <div className="sidebar-bottom">
        <button className="new-booking-btn" onClick={handleOpenModal}>
          <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"></path></svg>
          New Booking
        </button>
      </div>

      <CreateBookingModal 
        isOpen={isBookingModalOpen} 
        onClose={handleCloseModal} 
      />
    </aside>
  );
}
