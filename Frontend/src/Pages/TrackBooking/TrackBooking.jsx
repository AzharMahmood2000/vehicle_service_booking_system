import React, { useState, useRef } from 'react';
import Navbar from '../../Components/Navbar';
import Footer from '../../Components/Footer';
import API_BASE_URL from '../../api';
import { Ticket, Phone } from 'lucide-react';
import './TrackBooking.css';

export default function TrackBooking() {
  const [refNum, setRefNum] = useState('');
  const [phone, setPhone] = useState('');
  const [trackingResult, setTrackingResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const isTrackingRef = useRef(false);

  const handleTrack = async (e) => {
    e.preventDefault();
    
    if (isTrackingRef.current) return;
    isTrackingRef.current = true;

    try {
      setError('');
      setTrackingResult(null);

      const checkRef = refNum.trim();
      const checkPhone = phone.trim();

      if (!checkRef) {
        setError('Booking Reference Number is required.');
        return;
      }
      if (!checkPhone) {
        setError('Phone Number is required.');
        return;
      }

      setIsLoading(true);

      const res = await fetch(`${API_BASE_URL}/bookings/track/${encodeURIComponent(checkRef)}?phone=${encodeURIComponent(checkPhone)}`);
      const data = await res.json();
      
      if (!res.ok) {
         setError(data.message || 'Booking not found. Please check your reference number and phone number.');
         setIsLoading(false);
         return;
      }

      if (data.bookings && data.bookings.length > 0) {
        // Phone tracking is now secured natively by backend
        const foundBooking = data.bookings[0];

        if (foundBooking) {
          const customerFirstName = foundBooking.customerName.split(' ')[0];
          const bkStatus = foundBooking.status; // e.g., 'REQUEST PENDING', 'APPROVED', etc.
          
          let displayStatus = bkStatus;
          let message = '';
          
          switch(bkStatus) {
            case 'REQUEST PENDING':
              displayStatus = 'Pending Review';
              message = `Hi ${customerFirstName}, we have received your booking request. Our service team is reviewing it.`;
              break;
            case 'APPROVED':
              displayStatus = 'Approved';
              message = 'Your booking has been approved and scheduled.';
              break;
            case 'IN PROGRESS':
              displayStatus = 'In Progress';
              message = 'Your vehicle service is currently in progress.';
              break;
            case 'COMPLETED':
              displayStatus = 'Completed';
              message = 'Your vehicle service has been completed.';
              break;
            case 'REJECTED':
              displayStatus = 'Rejected';
              message = 'Your booking request was not approved. Please contact the service center if you need assistance.';
              break;
            case 'CANCELLED':
              displayStatus = 'Cancelled';
              message = 'This booking has been cancelled.';
              break;
          }

          // Format Date
          let formattedDate = foundBooking.appointmentDate;
          if (formattedDate) {
            const dateObj = new Date(formattedDate.includes('T') ? formattedDate.split('T')[0] : formattedDate);
            if (!isNaN(dateObj.getDate())) {
               formattedDate = `${dateObj.getDate()} ${dateObj.toLocaleString('default', { month: 'long' })} ${dateObj.getFullYear()}`;
            }
          }

          // Format Time
          let formattedTime = foundBooking.startTime;
          if (foundBooking.endTime) {
            formattedTime = `${foundBooking.startTime} - ${foundBooking.endTime}`;
          }

          // Format Service & Vehicle
          const serviceName = foundBooking.serviceId?.title || foundBooking.serviceName || 'Standard Service';
          const vehicleLabel = foundBooking.vehicleNumber || foundBooking.numberPlate || 'Vehicle';

          // Show Bay if approved, in-progress, or completed
          let displayBay = null;
          if (['APPROVED', 'IN PROGRESS', 'COMPLETED'].includes(bkStatus)) {
            displayBay = foundBooking.serviceBay?.name;
          }

          setTrackingResult({
            reference: foundBooking.referenceNumber,
            statusRaw: bkStatus,
            statusDisplay: displayStatus,
            customer: foundBooking.customerName,
            vehicle: vehicleLabel,
            service: serviceName,
            date: formattedDate,
            time: formattedTime,
            bay: displayBay,
            message
          });
        } else {
          setError('Booking not found. Please check your reference number and phone number.');
        }
      } else {
         setError('Booking not found. Please check your reference number and phone number.');
      }
    } catch (err) {
      setError('Network error tracking booking. Please try again later.');
    } finally {
      isTrackingRef.current = false;
      setIsLoading(false);
    }
  };

  return (
    <div className="track-booking-page">
      <Navbar />

      <section className="track-hero-section">
        <h1 className="track-hero-title">Track Your Booking</h1>
        <p className="track-hero-subtitle">Enter your booking reference number and phone number to see the real-time status of your vehicle's service.</p>
      </section>

      <div className="track-content-wrapper">
        <form className="track-form track-form-card" onSubmit={handleTrack}>
          {error && <div className="track-error-message">{error}</div>}
          
          <div className="track-form-fields">
            <div className="track-field">
              <label htmlFor="bookingReference" className="form-label">BOOKING REFERENCE NUMBER</label>
              <div className="track-input-box">
                <Ticket className="track-field-icon" aria-hidden="true" />
                <input 
                  id="bookingReference"
                  type="text" 
                  placeholder="VSB-2026-00125" 
                  value={refNum}
                  onChange={(e) => setRefNum(e.target.value)}
                  className="form-input"
                  disabled={isLoading}
                />
              </div>
            </div>
            
            <div className="track-field">
              <label htmlFor="phoneNumber" className="form-label">PHONE NUMBER</label>
              <div className="track-input-box">
                <Phone className="track-field-icon" aria-hidden="true" />
                <input 
                  id="phoneNumber"
                  type="text" 
                  placeholder="076-234576" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="form-input"
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>
          <button type="submit" className="btn-primary flex-center track-button" disabled={isLoading}>
            {isLoading ? (
              'Searching...'
            ) : (
              <>
                <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="btn-icon">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
                Track Booking
              </>
            )}
          </button>
        </form>

        {trackingResult && (
          <div className="tracking-result-card">
            <div className="result-header">
              <div className="result-reference-wrapper">
                <div className="reference-icon">
                  <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"></path>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10.512A1 1 0 004 17.512h1m8-1.512V10h3l3 3v4h-1m-4-1.512H9"></path>
                  </svg>
                </div>
                <div>
                  <span className="reference-label">REFERENCE</span>
                  <h3 className="reference-value">{trackingResult.reference}</h3>
                </div>
              </div>
              <div className="status-badge" style={{ backgroundColor: ['REJECTED', 'CANCELLED'].includes(trackingResult.statusRaw) ? '#E11D48' : '#FFD700', color: ['REJECTED', 'CANCELLED'].includes(trackingResult.statusRaw) ? '#FFF' : '#200130' }}>
                {trackingResult.statusDisplay}
              </div>
            </div>

            <div className="result-body">
              <div className="result-info-grid">
                <div className="track-result-info-item">
                  <span className="track-result-info-label">CUSTOMER</span>
                  <p className="track-result-info-value">{trackingResult.customer}</p>
                </div>
                <div className="track-result-info-item">
                  <span className="track-result-info-label">VEHICLE</span>
                  <p className="track-result-info-value">{trackingResult.vehicle}</p>
                </div>
                <div className="track-result-info-item">
                  <span className="track-result-info-label">SERVICE</span>
                  <p className="track-result-info-value">{trackingResult.service}</p>
                </div>
                <div className="track-result-info-item">
                  <span className="track-result-info-label">DATE</span>
                  <p className="track-result-info-value">{trackingResult.date}</p>
                </div>
                <div className="track-result-info-item">
                  <span className="track-result-info-label">TIME</span>
                  <p className="track-result-info-value">{trackingResult.time}</p>
                </div>
                {trackingResult.bay && (
                  <div className="track-result-info-item">
                    <span className="track-result-info-label">SERVICE BAY</span>
                    <p className="track-result-info-value">{trackingResult.bay}</p>
                  </div>
                )}
              </div>

              {!['REJECTED', 'CANCELLED'].includes(trackingResult.statusRaw) && (
                <div className="timeline-container">
                  <div className="timeline-line"></div>
                  <div className="timeline-active-line" style={{ 
                      width: trackingResult.statusRaw === 'COMPLETED' ? '100%' 
                           : trackingResult.statusRaw === 'IN PROGRESS' ? '66%' 
                           : trackingResult.statusRaw === 'APPROVED' ? '33%' 
                           : '0%' 
                  }}></div>

                  {['REQUEST PENDING', 'APPROVED', 'IN PROGRESS', 'COMPLETED'].map((stepStatus, index, arr) => {
                    let currentStatusIndex = arr.indexOf(trackingResult.statusRaw);
                    if (currentStatusIndex === -1) {
                      currentStatusIndex = 0; // fallback to starting node just in case
                    }
                    
                    const isCompleted = index < currentStatusIndex || trackingResult.statusRaw === 'COMPLETED';
                    const isActive = index === currentStatusIndex && trackingResult.statusRaw !== 'COMPLETED';
                    
                    const labelMap = {
                      'REQUEST PENDING': 'Submitted',
                      'APPROVED': 'Approved',
                      'IN PROGRESS': 'In Progress',
                      'COMPLETED': 'Completed'
                    };

                    return (
                      <div className="timeline-step" key={stepStatus}>
                        <div className={`timeline-node ${isCompleted ? 'node-completed' : ''} ${isActive ? 'node-active' : ''}`}>
                          {isCompleted && (
                            <svg fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="node-icon">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path>
                            </svg>
                          )}
                        </div>
                        <span className={`timeline-label ${isCompleted ? 'label-completed' : ''} ${isActive ? 'label-active' : ''}`}>
                          {labelMap[stepStatus]}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="message-box">
                <div className="message-icon">
                  <svg fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                </div>
                <div>
                  <h4 className="message-title">Message from Service Center</h4>
                  <p className="message-text">{trackingResult.message}</p>
                </div>
              </div>

            </div>
          </div>
        )}
      </div>

      {trackingResult && (
        <section className="features-section">
          <h3 className="features-title">
            <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="features-header-icon">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path>
            </svg>
            Why maintain with VehicleCare?
          </h3>
          
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon feature-icon-pink">
                <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path>
                </svg>
              </div>
              <h4 className="feature-name">Expert Technicians</h4>
              <p className="feature-desc">Certified professionals with 10+ years experience in high-performance vehicles.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon feature-icon-yellow">
                <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
              </div>
              <h4 className="feature-name">Rapid Service</h4>
              <p className="feature-desc">Our streamlined workshop ensures your vehicle returns to the road in record time.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon feature-icon-purple">
                <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
              </div>
              <h4 className="feature-name">Digital History</h4>
              <p className="feature-desc">Every bolt tightened is recorded in your secure, permanent digital logbook.</p>
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}
