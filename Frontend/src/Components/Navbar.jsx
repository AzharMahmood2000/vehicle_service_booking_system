import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  // Check if admin is already authenticated
  const adminToken =
    localStorage.getItem('vehiclecare_admin_token') ||
    sessionStorage.getItem('vehiclecare_admin_token');

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo" onClick={() => navigate('/')}>
          <div className="navbar-logo-icon">V</div>
          <span className="navbar-logo-text">VehicleCare</span>
        </div>
        
        <div className="navbar-desktop-links">
          <ul className={`navbar-links ${menuOpen ? 'menu-open' : ''}`}>
            {[
              { to: '/', label: 'Home' },
              { to: '/services', label: 'Services' },
              { to: '/about', label: 'About Us' },
              { to: '/track-booking', label: 'Track Booking' }
            ].map((link, idx) => (
              <li key={idx} className="nav-item">
                <NavLink 
                  to={link.to} 
                  onClick={() => setMenuOpen(false)} 
                  className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
            <li className="nav-item nav-item-admin">
              <NavLink
                to={adminToken ? '/admin/dashboard' : '/admin-login'}
                onClick={() => setMenuOpen(false)}
                className={({isActive}) => `nav-admin-btn ${isActive ? 'active' : ''}`}
                id="navbar-admin-login"
              >
                {adminToken ? 'Admin Panel' : 'Admin Login'}
              </NavLink>
            </li>
          </ul>
        </div>

        <button 
          className={`hamburger-menu ${menuOpen ? 'is-active' : ''}`} 
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
