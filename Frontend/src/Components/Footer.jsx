import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebookF, FaInstagram, FaLinkedinIn } from 'react-icons/fa';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer-section">
      <div className="footer-container">
        
        {/* Brand Info */}
        <div className="footer-brand">
          <div className="footer-logo">
            <div className="footer-logo-badge">V</div>
            <span className="footer-logo-text">VehicleCare</span>
          </div>
          <p className="footer-desc">
            Bring true performance back right with
            professional automotive maintenance and
            repair you can trust and rely on.
          </p>
        </div>
        
        {/* Quick Links */}
        <div className="footer-column">
          <h4 className="footer-heading">QUICK LINKS</h4>
          <ul className="footer-links">
            <li><Link to="/services" className="footer-link">Services</Link></li>
            <li><Link to="/about" className="footer-link">About Us</Link></li>
            <li><Link to="/track-booking" className="footer-link">Track Booking</Link></li>
          </ul>
        </div>
        
        {/* Connect */}
        <div className="footer-column">
          <h4 className="footer-heading">CONNECT</h4>
          <div className="footer-socials">
            <a href="#" target="_blank" rel="noopener noreferrer" className="footer-social-icon" aria-label="Facebook">
              <FaFacebookF aria-hidden="true" />
            </a>
            <a href="#" target="_blank" rel="noopener noreferrer" className="footer-social-icon" aria-label="Instagram">
              <FaInstagram aria-hidden="true" />
            </a>
            <a href="#" target="_blank" rel="noopener noreferrer" className="footer-social-icon" aria-label="LinkedIn">
              <FaLinkedinIn aria-hidden="true" />
            </a>
          </div>
        </div>
        
        {/* Policies */}
        <div className="footer-column">
          <h4 className="footer-heading">POLICIES</h4>
          <ul className="footer-links">
            <li><Link to="/privacy-policy" className="footer-link">Privacy Policy</Link></li>
            <li><Link to="/terms-of-service" className="footer-link">Terms of Service</Link></li>
            <li><Link to="/contact" className="footer-link">Contact Us</Link></li>
          </ul>
        </div>
        
      </div>
      
      {/* Copyright */}
      <div className="footer-bottom">
        <p className="footer-copyright">COPYRIGHT 2026 © VehicleCare. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
