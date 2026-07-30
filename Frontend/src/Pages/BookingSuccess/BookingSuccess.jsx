import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Navbar from '../../Components/Navbar';
import Footer from '../../Components/Footer';
import './BookingSuccess.css';

/* Display-only time formatter */
function formatTime12h(time24) {
  if (!time24) return '';
  const [hStr, mStr] = time24.split(':');
  let h = parseInt(hStr, 10);
  const suffix = h >= 12 ? 'PM' : 'AM';
  if (h === 0) h = 12;
  else if (h > 12) h -= 12;
  return `${h}:${mStr} ${suffix}`;
}

/* Date formatter */
function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }).format(d);
}

/* Status config mapping */
function getStatusConfig(status) {
  switch (status) {
    case 'REQUEST PENDING': return { label: 'Pending Review', pillClass: 'status-yellow', textStyle: { color: '#D97706' } };
    case 'APPROVED': return { label: 'Approved', pillClass: 'status-green', textStyle: { color: '#16A34A' } };
    case 'IN PROGRESS': return { label: 'In Progress', pillClass: 'status-blue', textStyle: { color: '#3B82F6' } };
    case 'COMPLETED': return { label: 'Completed', pillClass: 'status-green', textStyle: { color: '#16A34A' } };
    case 'REJECTED': return { label: 'Rejected', pillClass: 'status-red', textStyle: { color: '#DC2626' } };
    case 'CANCELLED': return { label: 'Cancelled', pillClass: 'status-neutral', textStyle: { color: '#6B7280' } };
    default: return { label: 'Pending Review', pillClass: 'status-yellow', textStyle: { color: '#D97706' } };
  }
}

export default function BookingSuccess() {
  const location = useLocation();
  const stateBooking = location.state?.booking;

  const [booking] = useState(stateBooking || null);

  const refNumber = booking?.referenceNumber || booking?.id || '—';

  /* Service name: prefer populated serviceId.title, fall back to serviceName field */
  const serviceName =
    (booking?.serviceId && typeof booking.serviceId === 'object'
      ? booking.serviceId.title
      : null) ||
    booking?.serviceName ||
    '—';

  const vehicleNumber = booking?.vehicleNumber || booking?.numberPlate || '—';

  const dateValue = formatDate(booking?.appointmentDate) || '—';
  const timeValue = formatTime12h(booking?.startTime) || '—';

  const rawStatus = booking?.status || 'REQUEST PENDING';
  const currentStatus = getStatusConfig(rawStatus);

  const handleCopy = () => {
    if (refNumber !== '—') {
      navigator.clipboard.writeText(refNumber);
    }
  };

  return (
    <div className="bs-page-container">
      <Navbar />
      
      <div className="bs-header-wrapper">
        <h1 className="bs-page-title">Book your vehicle service</h1>
        <span className="bs-page-subtitle">CONFIRMATION</span>
      </div>

      <div className="bs-card">
        
        {/* Pink Success Circle */}
        <div className="bs-card-top-icon">
          <svg fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>

        <h2 className="bs-card-title">Booking submitted</h2>
        
        {/* Status Pill */}
        <div className={`bs-status-pill ${currentStatus.pillClass}`}>
          <svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style={{ width: 14, height: 14 }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          {currentStatus.label}
        </div>

        {/* Reference Box */}
        <div className="bs-ref-box">
          <div className="bs-ref-label">BOOKING REFERENCE</div>
          <div className="bs-ref-number">{refNumber}</div>
          <button 
            type="button" 
            onClick={handleCopy}
            className="bs-ref-copy-btn"
            title="Copy Reference"
          >
            <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style={{ width: 22, height: 22 }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
            </svg>
          </button>
        </div>

        {/* Save Reference Helper */}
        <div className="bs-helper-text">
          <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <span>Please save this reference number. You will need it to track your booking status.</span>
        </div>

        {/* Confirmation Message */}
        <p className="bs-message">
          Thank you for choosing VehicleCare. Your booking is currently being reviewed by our service team. You can use your booking reference number to check whether your booking has been approved, rejected, or completed.
        </p>

        {/* 2-Column Details Block */}
        <div className="bs-details-grid">
          <div className="bs-detail-item">
            <span className="bs-detail-label">SERVICE</span>
            <span className="bs-detail-value">{serviceName}</span>
          </div>
          <div className="bs-detail-item">
            <span className="bs-detail-label">VEHICLE NUMBER</span>
            <span className="bs-detail-value uppercase">{vehicleNumber}</span>
          </div>
          <div className="bs-detail-item">
            <span className="bs-detail-label">APPOINTMENT DATE</span>
            <span className="bs-detail-value">{dateValue}</span>
          </div>
          <div className="bs-detail-item">
            <span className="bs-detail-label">APPOINTMENT TIME</span>
            <span className="bs-detail-value">{timeValue}</span>
          </div>
          <div className="bs-detail-item full-width">
            <span className="bs-detail-label">CURRENT STATUS</span>
            <span className="bs-detail-value" style={currentStatus.textStyle}>{currentStatus.label}</span>
          </div>
        </div>

        {/* Print Action */}
        <button className="bs-print-btn" onClick={() => window.print()}>
          <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path>
          </svg>
          Print Booking
        </button>

        {/* Action Buttons */}
        <div className="bs-buttons-wrapper">
          <Link to="/track-booking" className="bs-primary-btn">
            <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style={{ width: 18, height: 18 }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
            Track Booking
          </Link>
          <Link to="/booking" className="bs-secondary-btn">
            Book Another Service
          </Link>
        </div>

        {/* Footnote */}
        <p className="bs-footnote">
          Our service team will review your appointment request. Check your booking status using the reference number.
        </p>
      </div>

      <Footer />
    </div>
  );
}
