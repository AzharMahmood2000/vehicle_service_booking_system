import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../Components/Navbar';
import Footer from '../../Components/Footer';
import { getServiceDuration } from '../../data/mockBookings';
import { getBookings, saveBooking } from '../../utils/bookingStorage';
import { getAvailableStartTimes, assignAvailableBay, formatTime12h } from '../../utils/bookingAvailability';
import './Booking.css';

export default function Booking() {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    serviceType: "",
    preferredDate: "",
    preferredTime: "",
    endTime: "",
    customerName: "",
    phoneNumber: "",
    vehicleNumber: "",
    vehicleModel: ""
  });
  
  const [errorMsg, setErrorMsg] = useState("");
  const [availableTimes, setAvailableTimes] = useState([]);
  const [allBookings, setAllBookings] = useState([]);

  const [showBookingForm, setShowBookingForm] = useState(false);
  const part2Ref = React.useRef(null);
  const part1Ref = React.useRef(null);

  useEffect(() => {
    setAllBookings(getBookings());
    
    if (window.location.hash === '#availability' && part1Ref.current) {
      setTimeout(() => {
        part1Ref.current.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    }
  }, []);

  useEffect(() => {
    if (formData.serviceType && formData.preferredDate) {
      const duration = getServiceDuration(formData.serviceType);

      const mappedBookings = allBookings.map(b => ({
        date: b.appointmentDate,
        startTime: b.startTime,
        endTime: b.endTime,
        bayId: b.serviceBay
      }));

      const times = getAvailableStartTimes(formData.preferredDate, duration, mappedBookings);
      setAvailableTimes(times);
      
      if (formData.preferredTime && !times.find(t => t.startTime === formData.preferredTime)) {
        setFormData(prev => ({ ...prev, preferredTime: "", endTime: "" }));
        setShowBookingForm(false);
      }
    } else {
      setAvailableTimes([]);
      setFormData(prev => ({ ...prev, preferredTime: "", endTime: "" }));
      setShowBookingForm(false);
    }
  }, [formData.serviceType, formData.preferredDate, allBookings]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'serviceType' || name === 'preferredDate') {
      setFormData(prev => ({ ...prev, [name]: value, preferredTime: "", endTime: "" }));
      setShowBookingForm(false);
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleTimeSelect = (startTime, endTime) => {
    setFormData(prev => ({ ...prev, preferredTime: startTime, endTime }));
  };

  const handleContinueToBooking = () => {
    setShowBookingForm(true);
    setTimeout(() => {
      part2Ref.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleChangeSelection = () => {
    setShowBookingForm(false);
    setTimeout(() => {
      part1Ref.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.serviceType || !formData.preferredDate || !formData.preferredTime) {
      setErrorMsg("Please select a service, date, and a valid start time.");
      return;
    }

    if (!formData.vehicleModel.trim()) {
      setErrorMsg("Please enter your vehicle model.");
      return;
    }

    const startStr = Date.now().toString();
    const referenceNumber = `BK${startStr.slice(-8)}`;
    const duration = getServiceDuration(formData.serviceType);

    const mappedBookings = allBookings.map(b => ({
      date: b.appointmentDate,
      startTime: b.startTime,
      endTime: b.endTime,
      bayId: b.serviceBay
    }));

    const dateBookings = mappedBookings.filter(b => b.date === formData.preferredDate);
    const assignedBay = assignAvailableBay(formData.preferredTime, formData.endTime, dateBookings, formData.preferredDate);

    if (!assignedBay) {
      setErrorMsg("Sorry, no bays are currently available for this time slot. Please refresh and try again.");
      return;
    }

    setErrorMsg("");
    
    const svcNames = {
      'oil': 'Oil Change',
      'wash': 'Vehicle Wash',
      'brakes': 'Brake Service',
      'battery': 'Battery Service',
      'alignment': 'Wheel Alignment',
      'diagnostics': 'Engine Diagnostics',
      'ac-service': 'AC Service',
      'basic': 'Basic Service',
      'full': 'Full Vehicle Service'
    };

    const newBooking = {
      id: referenceNumber,
      referenceNumber: referenceNumber,
      customerName: formData.customerName,
      phoneNumber: formData.phoneNumber,
      serviceId: formData.serviceType,
      serviceName: svcNames[formData.serviceType] || "General Service",
      estimatedDuration: duration,
      appointmentDate: formData.preferredDate,
      startTime: formData.preferredTime,
      endTime: formData.endTime,
      serviceBay: assignedBay,
      vehicleModel: formData.vehicleModel,
      numberPlate: formData.vehicleNumber,
      status: "REQUEST PENDING",
      createdAt: new Date().toISOString()
    };
    
    saveBooking(newBooking);
    navigate('/booking-success', { state: { booking: newBooking } });
  };

  let durationLabel = "";
  if (formData.serviceType) {
    const durationMins = getServiceDuration(formData.serviceType);
    const durationHours = durationMins / 60;
    const suffix = durationMins > 60 ? "s" : "";
    durationLabel = `${durationHours} Hour${suffix}`;
  }

  const isFullyBookedDate = formData.serviceType && formData.preferredDate && availableTimes.length === 0;
  
  const totalCapacityHours = 32;
  let bookedCapacityHours = 0;
  
  if (formData.preferredDate && allBookings) {
    bookedCapacityHours = allBookings
      .filter(booking => booking.appointmentDate === formData.preferredDate)
      .reduce((sum, booking) => sum + (booking.estimatedDuration || 0) / 60, 0);
  }
  const availableCapacityHours = Math.max(0, totalCapacityHours - bookedCapacityHours);

  return (
    <div className="booking-page">
      <Navbar />
      
      <div className="booking-content-wrapper">
        <div className="booking-header-box">
          <span className="booking-premium-badge">PREMIUM CARE</span>
          <h1 className="booking-main-title">Book your vehicle service</h1>
          <p className="booking-subtitle">Experience the nightlife-inspired precision of our automotive experts.</p>
        </div>

        <div className="booking-card">
        
          {/* PART 1: CHECK AVAILABILITY */}
          <div className="booking-step" ref={part1Ref} style={{ display: showBookingForm ? 'none' : 'block' }}>
            <div className="step-header">
              <h2 className="step-title">Part 1: Check Service Availability</h2>
              <p className="step-desc">Select your required service and preferred date to view available workshop times.</p>
            </div>
            
            <div className="form-content">
              <div className="form-group">
                <label className="form-label">Service Type</label>
                <select 
                  name="serviceType"
                  value={formData.serviceType}
                  onChange={handleChange}
                  required
                  className="form-input"
                >
                  <option value="" disabled>Select service</option>
                  <option value="oil">Oil Change</option>
                  <option value="wash">Vehicle wash</option>
                  <option value="brakes">Brake Service</option>
                  <option value="battery">Battery Service</option>
                  <option value="alignment">Wheel alignment</option>
                  <option value="diagnostics">Engine Diagnostics</option>
                  <option value="ac-service">AC Service</option>
                  <option value="basic">Basic Service</option>
                  <option value="full">Full Vehicle Service</option>
                </select>
                {formData.serviceType && (
                  <div className="duration-info-box">
                    <strong className="duration-info-label">Estimated Service Duration:</strong> {durationLabel}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Preferred Date</label>
                <input 
                  type="date" 
                  name="preferredDate"
                  value={formData.preferredDate}
                  onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]} 
                  required
                  className="form-input"
                />
              </div>

              {formData.serviceType && formData.preferredDate && (
                <div className="capacity-info-box">
                  <h4 className="capacity-title">SELECTED DATE CAPACITY</h4>
                  <div className="capacity-stats">
                    <div className="capacity-metric"><strong>{totalCapacityHours}</strong> Total Capacity Hours</div>
                    <div className="capacity-metric"><strong>{bookedCapacityHours}</strong> Hours Reserved</div>
                    <div className="capacity-metric"><strong>{availableCapacityHours}</strong> Hours Available</div>
                  </div>
                  <p className="capacity-footnote">Exact available booking times depend on your selected service duration.</p>
                </div>
              )}

              {formData.serviceType && formData.preferredDate && (
                <>
                  <div className="available-times-header">
                    <span className="available-times-title">Available Start Times</span>
                  </div>
                  
                  <div className="times-container">
                    {isFullyBookedDate ? (
                      <div className="no-times-error">
                        No available service times for this date. Please choose another date.
                      </div>
                    ) : (
                      <div className="times-grid">
                        {availableTimes.map((slot) => {
                          const isSelected = formData.preferredTime === slot.startTime;
                          let capacityClass = "capacity-good";
                          let capacityText = `${slot.availableBaysCount} Bays Available`;
                          
                          if (slot.availableBaysCount === 1) {
                            capacityClass = "capacity-low";
                            capacityText = "Only 1 slot left";
                          } else if (slot.availableBaysCount === 2) {
                            capacityClass = "capacity-medium";
                          }

                          return (
                            <div 
                              key={slot.startTime}
                              className={`time-slot ${isSelected ? 'selected' : ''}`}
                              onClick={() => handleTimeSelect(slot.startTime, slot.endTime)}
                            >
                              <div className={`time-text ${isSelected ? 'selected-text' : ''}`}>{formatTime12h(slot.startTime)}</div>
                              <div className={`capacity-badge ${capacityClass}`}>{capacityText}</div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  
                  {formData.preferredTime && (
                    <div className="success-message-box">
                      <strong>Service slot available:</strong><br/>
                      {formatTime12h(formData.preferredTime)} &ndash; {formatTime12h(formData.endTime)}
                    </div>
                  )}

                  {formData.preferredTime && (
                    <button 
                      type="button"
                      className="btn-primary"
                      onClick={handleContinueToBooking}
                    >
                      Check Availability
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* PART 2: BOOK YOUR SERVICE */}
          <div className="booking-step" ref={part2Ref} style={{ display: showBookingForm ? 'block' : 'none' }}>
            <div className="step-header">
               <button type="button" className="btn-change-selection" onClick={handleChangeSelection}>
                &larr; Change service or date
              </button>
            </div>

            <form onSubmit={handleSubmit} className="booking-form">
              {errorMsg && <div className="error-message-box">⚠ {errorMsg}</div>}

              <div className="form-group">
                <label className="form-label">Customer Name</label>
                <input 
                  type="text" 
                  name="customerName"
                  placeholder="Sumith" 
                  value={formData.customerName}
                  onChange={handleChange}
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input 
                  type="tel" 
                  name="phoneNumber"
                  placeholder="076-1234567" 
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Vehicle Number</label>
                <div className="input-with-badge">
                  <span className="input-badge">PLATE</span>
                  <input 
                    type="text" 
                    name="vehicleNumber"
                    placeholder="ABC-1234" 
                    value={formData.vehicleNumber}
                    onChange={handleChange}
                    required
                    className="form-input input-padded"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Vehicle Model</label>
                <input 
                  type="text" 
                  name="vehicleModel"
                  placeholder="Enter vehicle model" 
                  value={formData.vehicleModel}
                  onChange={handleChange}
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Service Type</label>
                <select 
                  className="form-input"
                  disabled
                >
                  <option value="">{document.querySelector(`option[value="${formData.serviceType}"]`)?.innerText || formData.serviceType}</option>
                </select>
              </div>

              <div className="form-row">
                <div className="form-group row-item">
                  <label className="form-label">Preferred Date</label>
                  <input 
                    type="text" 
                    value={formData.preferredDate}
                    disabled
                    className="form-input"
                  />
                </div>
                <div className="form-group row-item">
                  <label className="form-label">Preferred Time</label>
                  <input 
                    type="text" 
                    value={formData.preferredTime ? `${formatTime12h(formData.preferredTime)} - ${formatTime12h(formData.endTime)}` : ''}
                    disabled
                    className="form-input"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn-primary btn-submit"
              >
                Submit booking
              </button>
              
              <p className="form-footnote">
                You'll see your booking status update once the desk reviews it.
              </p>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
