import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaFacebookF, FaInstagram, FaLinkedinIn } from 'react-icons/fa';
import API_BASE_URL from '../api';
import './Footer.css';

const Footer = () => {
  const [socials, setSocials] = useState({ facebookUrl: "", instagramUrl: "", linkedinUrl: "" });

  useEffect(() => {
    fetch(`${API_BASE_URL}/settings/contact_info`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.setting && data.setting.value) {
          setSocials({
            facebookUrl: data.setting.value.facebookUrl || "",
            instagramUrl: data.setting.value.instagramUrl || "",
            linkedinUrl: data.setting.value.linkedinUrl || ""
          });
        }
      })
      .catch(() => { /* Silent fail */ });
  }, []);

  const isValidUrl = (url) => typeof url === 'string' && (url.startsWith('http://') || url.startsWith('https://'));
  const hasFb = isValidUrl(socials.facebookUrl);
  const hasIg = isValidUrl(socials.instagramUrl);
  const hasIn = isValidUrl(socials.linkedinUrl);

  const disabledStyle = { opacity: 0.5, cursor: 'not-allowed' };

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
            {hasFb ? (
              <a href={socials.facebookUrl} target="_blank" rel="noopener noreferrer" className="footer-social-icon" aria-label="Facebook">
                <FaFacebookF aria-hidden="true" />
              </a>
            ) : (
              <span className="footer-social-icon" style={disabledStyle} aria-label="Facebook" aria-disabled="true">
                <FaFacebookF aria-hidden="true" />
              </span>
            )}
            
            {hasIg ? (
              <a href={socials.instagramUrl} target="_blank" rel="noopener noreferrer" className="footer-social-icon" aria-label="Instagram">
                <FaInstagram aria-hidden="true" />
              </a>
            ) : (
              <span className="footer-social-icon" style={disabledStyle} aria-label="Instagram" aria-disabled="true">
                <FaInstagram aria-hidden="true" />
              </span>
            )}
            
            {hasIn ? (
              <a href={socials.linkedinUrl} target="_blank" rel="noopener noreferrer" className="footer-social-icon" aria-label="LinkedIn">
                <FaLinkedinIn aria-hidden="true" />
              </a>
            ) : (
              <span className="footer-social-icon" style={disabledStyle} aria-label="LinkedIn" aria-disabled="true">
                <FaLinkedinIn aria-hidden="true" />
              </span>
            )}
          </div>
        </div>
        
        {/* Policies */}
        <div className="footer-column">
          <h4 className="footer-heading">POLICIES</h4>
          <ul className="footer-links">
            <li><a href="/#contact" className="footer-link">Contact Us</a></li>
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
