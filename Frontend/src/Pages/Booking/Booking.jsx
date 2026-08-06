import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../../Components/Navbar';
import Footer from '../../Components/Footer';
import API_BASE_URL from '../../api';
import './Booking.css';

/* ───────── Display-only time formatter ───────── */
function formatTime12h(time24) {
  if (!time24) return '';
  const [hStr, mStr] = time24.split(':');
  let h = parseInt(hStr, 10);
  const suffix = h >= 12 ? 'PM' : 'AM';
  if (h === 0) h = 12;
  else if (h > 12) h -= 12;
  return `${h}:${mStr} ${suffix}`;
}

/* ───────── Duration label formatter ───────── */
function formatDuration(mins) {
  if (!mins) return '';
  const hours = Math.floor(mins / 60);
  const remaining = mins % 60;
  if (hours === 0) return `${mins} minutes`;
  if (remaining === 0) {
    return `${mins} minutes / ${hours} hour${hours > 1 ? 's' : ''}`;
  }
  return `${mins} minutes / ${hours} hour${hours > 1 ? 's' : ''} ${remaining} minutes`;
}

export default function Booking() {
  const navigate = useNavigate();
  const location = useLocation();

  /* ── Service list from backend ── */
  const [services, setServices] = useState([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [servicesError, setServicesError] = useState('');

  /* ── Availability from backend ── */
  const [availableSlots, setAvailableSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsMessage, setSlotsMessage] = useState('');

  /* ── Form state ── */
  const [formData, setFormData] = useState({
    serviceType: '',
    preferredDate: '',
    preferredTime: '',
    endTime: '',
    customerName: '',
    phoneNumber: '',
    vehicleNumber: '',
    vehicleModel: ''
  });

  const [errorMsg, setErrorMsg] = useState('');
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmittingRef = useRef(false);

  const part2Ref = React.useRef(null);
  const part1Ref = React.useRef(null);

  /* ═══════════════════════════════════════════════
     1. Fetch active services on mount
     ═══════════════════════════════════════════════ */
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setServicesLoading(true);
        setServicesError('');

        const response = await fetch(`${API_BASE_URL}/services`);
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || 'Failed to load services');
        }

        setServices(data.services);

        /* Pre-select if arriving from Services page "Book Now" */
        const incoming = location.state?.selectedService;
        if (incoming) {
          const matchId = incoming.id || incoming._id;
          const found = data.services.find(
            (s) => s._id === matchId
          );
          if (found) {
            setFormData((prev) => ({ ...prev, serviceType: found._id }));
          }
        }
      } catch (error) {
        console.error('Failed to fetch services:', error);
        setServicesError(error.message || 'Could not load services. Please try again later.');
      } finally {
        setServicesLoading(false);
      }
    };

    fetchServices();

    if (window.location.hash === '#availability' && part1Ref.current) {
      setTimeout(() => {
        part1Ref.current.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ═══════════════════════════════════════════════
     2. Fetch availability when service + date change
     ═══════════════════════════════════════════════ */
  useEffect(() => {
    if (!formData.serviceType || !formData.preferredDate) {
      setAvailableSlots([]);
      setSlotsMessage('');
      return;
    }

    const abortController = new AbortController();

    const fetchAvailability = async () => {
      try {
        setSlotsLoading(true);
        setSlotsMessage('');
        setAvailableSlots([]);

        const response = await fetch(
          `${API_BASE_URL}/availability/slots?date=${formData.preferredDate}&serviceId=${formData.serviceType}`,
          { signal: abortController.signal }
        );
        const data = await response.json();

        if (abortController.signal.aborted) return;

        if (!response.ok || !data.success) {
          throw new Error(data.message || 'Failed to check availability');
        }

        if (data.closed || data.sameDayBlocked || data.pastDate || data.beyondAdvanceLimit) {
          setSlotsMessage(data.message || 'This date is not available for booking. Please choose another date.');
          setAvailableSlots([]);
          return;
        }

        const onlyAvailable = data.slots.filter((slot) => slot.available);
        setAvailableSlots(onlyAvailable);

        if (onlyAvailable.length === 0) {
          setSlotsMessage('No available service times for this date. Please choose another date.');
        }
      } catch (error) {
        if (error.name === 'AbortError' || abortController.signal.aborted) return;
        console.error('Availability check failed:', error);
        setSlotsMessage(error.message || 'Failed to check availability.');
        setAvailableSlots([]);
      } finally {
        if (!abortController.signal.aborted) {
          setSlotsLoading(false);
        }
      }
    };

    fetchAvailability();

    return () => abortController.abort();
  }, [formData.serviceType, formData.preferredDate]);

  /* ═══════════════════════════════════════════════
     Handlers
     ═══════════════════════════════════════════════ */
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'serviceType' || name === 'preferredDate') {
      setFormData((prev) => ({ ...prev, [name]: value, preferredTime: '', endTime: '' }));
      setShowBookingForm(false);
      setErrorMsg('');
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleTimeSelect = (startTime, endTime) => {
    setFormData((prev) => ({ ...prev, preferredTime: startTime, endTime }));
  };

  const handleContinueToBooking = () => {
    setShowBookingForm(true);
    setTimeout(() => {
      part2Ref.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleChangeSelection = () => {
    setShowBookingForm(false);
    setErrorMsg('');
    setTimeout(() => {
      part1Ref.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  /* ═══════════════════════════════════════════════
     3. Submit booking to POST /api/bookings
     ═══════════════════════════════════════════════ */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;

    try {
      if (!formData.serviceType || !formData.preferredDate || !formData.preferredTime) {
        setErrorMsg('Please select a service, date, and a valid start time.');
        return;
      }

      if (!formData.vehicleModel.trim()) {
        setErrorMsg('Please enter your vehicle model.');
        return;
      }

      setErrorMsg('');
      setIsSubmitting(true);
      const response = await fetch(`${API_BASE_URL}/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: formData.customerName.trim(),
          phoneNumber: formData.phoneNumber.trim(),
          vehicleNumber: formData.vehicleNumber.trim(),
          vehicleModel: formData.vehicleModel.trim(),
          serviceId: formData.serviceType,
          appointmentDate: formData.preferredDate,
          startTime: formData.preferredTime
        })
      });

      const data = await response.json();

      if (response.status === 409) {
        setErrorMsg(data.message || 'This time slot is no longer available. Please select another.');
        setFormData((prev) => ({ ...prev, preferredTime: '', endTime: '' }));
        setShowBookingForm(false);

        /* Refresh availability so user sees updated slots */
        const refreshRes = await fetch(
          `${API_BASE_URL}/availability/slots?date=${formData.preferredDate}&serviceId=${formData.serviceType}`
        );
        const refreshData = await refreshRes.json();
        if (refreshRes.ok && refreshData.success && !refreshData.closed) {
          setAvailableSlots(refreshData.slots.filter((s) => s.available));
        }

        setIsSubmitting(false);
        return;
      }

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to create booking');
      }

      navigate('/booking-success', {
        state: { booking: data.booking }
      });
    } catch (error) {
      console.error('Booking submission failed:', error);
      setErrorMsg(error.message || 'Something went wrong. Please try again.');
    } finally {
      isSubmittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  /* ═══════════════════════════════════════════════
     Derived values
     ═══════════════════════════════════════════════ */
  const selectedService = services.find((s) => s._id === formData.serviceType);
  const durationLabel = selectedService ? formatDuration(selectedService.durationMins) : '';

  const isFullyBookedDate =
    formData.serviceType &&
    formData.preferredDate &&
    !slotsLoading &&
    availableSlots.length === 0 &&
    slotsMessage;

  /* ═══════════════════════════════════════════════
     Render
     ═══════════════════════════════════════════════ */
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
                  disabled={servicesLoading}
                >
                  <option value="" disabled>
                    {servicesLoading ? 'Loading services...' : 'Select service'}
                  </option>
                  {services.map((svc) => (
                    <option key={svc._id} value={svc._id}>
                      {svc.title}
                    </option>
                  ))}
                </select>

                {servicesError && (
                  <div className="error-message-box" style={{ marginTop: 8 }}>⚠ {servicesError}</div>
                )}

                {selectedService && (
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
                <>
                  <div className="available-times-header">
                    <span className="available-times-title">Available Start Times</span>
                  </div>

                  <div className="times-container">
                    {slotsLoading ? (
                      <div className="no-times-error" style={{ color: '#8F7897', backgroundColor: 'rgba(143,120,151,0.08)', borderColor: 'rgba(143,120,151,0.2)' }}>
                        Checking available times...
                      </div>
                    ) : isFullyBookedDate ? (
                      <div className="no-times-error">
                        {slotsMessage}
                      </div>
                    ) : (
                      <div className="times-grid">
                        {availableSlots.map((slot) => {
                          const isSelected = formData.preferredTime === slot.startTime;

                          return (
                            <div
                              key={slot.startTime}
                              className={`time-slot ${isSelected ? 'selected' : ''}`}
                              onClick={() => handleTimeSelect(slot.startTime, slot.endTime)}
                            >
                              <div className={`time-text ${isSelected ? 'selected-text' : ''}`}>{formatTime12h(slot.startTime)}</div>
                              <div className="capacity-badge capacity-good">Available</div>
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
                  <option value="">{selectedService?.title || formData.serviceType}</option>
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
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit booking'}
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
