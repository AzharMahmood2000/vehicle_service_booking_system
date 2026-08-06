import React, { useState, useEffect, useRef } from 'react';
import API_BASE_URL from '../api';

function formatTime12h(time24) {
  if (!time24) return '';
  const [hStr, mStr] = time24.split(':');
  let h = parseInt(hStr, 10);
  const suffix = h >= 12 ? 'PM' : 'AM';
  if (h === 0) h = 12;
  else if (h > 12) h -= 12;
  return `${h}:${mStr} ${suffix}`;
}

export default function CreateBookingModal({ isOpen, onClose, initialDate, onBookingCreated }) {
  const [serviceOptions, setServiceOptions] = useState([]);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmittingRef = useRef(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const [formData, setFormData] = useState({
    customerName: "",
    phoneNumber: "",
    vehicleNumber: "",
    vehicleModel: "",
    serviceId: "",
    preferredDate: ""
  });
  
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');

  // Load active services
  useEffect(() => {
    if (isOpen) {
      const fetchServices = async () => {
        setServicesLoading(true);
        try {
          const response = await fetch(`${API_BASE_URL}/services`);
          const data = await response.json();
          if (response.ok && data.success) {
            setServiceOptions(data.services);
            if (data.services.length > 0) {
              setFormData(prev => ({ ...prev, serviceId: data.services[0]._id }));
            }
          }
        } catch (err) {
          console.error("Failed to load services:", err);
        } finally {
          setServicesLoading(false);
        }
      };

      fetchServices();
      
      setFormData(prev => ({
        ...prev,
        customerName: "",
        phoneNumber: "",
        vehicleNumber: "",
        vehicleModel: "",
        preferredDate: initialDate || ""
      }));
      setSelectedTimeSlot('');
      setErrorMsg('');
    }
  }, [isOpen, initialDate]);

  // Load available slots dynamically when service or date change
  useEffect(() => {
    const abortController = new AbortController();

    if (isOpen && formData.serviceId && formData.preferredDate) {
      const fetchAvailability = async () => {
        setSlotsLoading(true);
        setErrorMsg('');
        setAvailableSlots([]);
        setSelectedTimeSlot('');

        try {
          const response = await fetch(
            `${API_BASE_URL}/availability/slots?date=${formData.preferredDate}&serviceId=${formData.serviceId}`,
            { signal: abortController.signal }
          );
          const data = await response.json();

          if (abortController.signal.aborted) return;

          if (!response.ok || !data.success) {
            throw new Error(data.message || 'Failed to fetch slots.');
          }

          if (data.closed || data.sameDayBlocked || data.pastDate || data.beyondAdvanceLimit) {
            setErrorMsg(data.message || 'This date is not available for booking. Please select another date.');
          } else {
            const availableOnly = data.slots.filter(slot => slot.available);
            setAvailableSlots(availableOnly);
            if (availableOnly.length === 0) {
              setErrorMsg('No available service capacity left for this date. Please select another time or date.');
            }
          }
        } catch (err) {
          if (err.name === 'AbortError' || abortController.signal.aborted) return;
          console.error(err);
          setErrorMsg(err.message || 'Failed to load availability slots.');
        } finally {
          if (!abortController.signal.aborted) {
            setSlotsLoading(false);
          }
        }
      };
      
      fetchAvailability();
    } else {
      setAvailableSlots([]);
      setSelectedTimeSlot('');
    }

    return () => abortController.abort();
  }, [isOpen, formData.serviceId, formData.preferredDate]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateBooking = async (e) => {
    e.preventDefault();

    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;

    try {
      if (!formData.customerName.trim()) {
        setErrorMsg("Please enter the customer name.");
        return;
      }
      if (!formData.phoneNumber.trim()) {
        setErrorMsg("Please enter the phone number.");
        return;
      }
      if (!formData.vehicleNumber.trim()) {
        setErrorMsg("Please enter the vehicle number.");
        return;
      }
      if (!formData.vehicleModel.trim()) {
        setErrorMsg("Please enter the vehicle model.");
        return;
      }
      if (!formData.preferredDate) {
        setErrorMsg("Please select a booking date.");
        return;
      }
      if (!selectedTimeSlot) {
        setErrorMsg("Please select an available booking slot.");
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
          serviceId: formData.serviceId,
          appointmentDate: formData.preferredDate,
          startTime: selectedTimeSlot
        })
      });

      const data = await response.json();

      if (response.status === 409) {
        setErrorMsg(data.message || 'Cannot accept booking due to capacity constraints. No service bay is available for this time.');
        setSelectedTimeSlot('');
        return;
      }

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to create booking.');
      }

      if (onBookingCreated) {
        onBookingCreated(data.booking);
      }
      onClose();
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Something went wrong while creating the booking.');
    } finally {
      isSubmittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  return (
    <div className="global-modal-overlay" onClick={onClose}>
      <div className="global-modal-container manual-booking-modal" onClick={e => e.stopPropagation()}>
        <div className="global-modal-header">
          <div>
            <h2>Create New Booking</h2>
            <p>Enter customer and vehicle details for the new service request.</p>
          </div>
          <button className="global-modal-close" onClick={onClose} type="button" disabled={isSubmitting}>
            <svg fill="currentColor" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
          </button>
        </div>
        
        <form className="global-modal-form" onSubmit={handleCreateBooking}>
          <div className="booking-form-scrollable">
            {errorMsg && (
               <div style={{ backgroundColor: 'rgba(225,29,72,0.1)', color: '#E11D48', padding: '12px', borderRadius: '6px', marginBottom: '16px', fontWeight: 'bold', fontSize: '13px' }}>
                 ⚠ {errorMsg}
               </div>
            )}
            
            {/* 1. CUSTOMER INFORMATION */}
            <div className="form-section">
              <h4 className="section-title">
                <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                CUSTOMER INFORMATION
              </h4>
              <div className="form-grid cols-2">
                <div className="form-group">
                  <label>FULL NAME</label>
                  <input type="text" name="customerName" value={formData.customerName} onChange={handleChange} placeholder="e.g. Isuru Perera" required disabled={isSubmitting} />
                </div>
                <div className="form-group">
                  <label>PHONE NUMBER</label>
                  <input type="text" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} placeholder="078-1234567" required disabled={isSubmitting} />
                </div>
              </div>
            </div>

            {/* 2. VEHICLE DETAILS */}
            <div className="form-section">
              <h4 className="section-title">
                <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M7 17m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0 M17 17m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0 M5 17h-2v-6l2 -5h9l4 5h1a2 2 0 0 1 2 2v4h-2m-4 0h-6m-6 -6h15m-6 0v-5"></path></svg>
                VEHICLE DETAILS
              </h4>
              <div className="form-grid cols-2">
                <div className="form-group">
                  <label>VEHICLE NUMBER</label>
                  <input type="text" name="vehicleNumber" value={formData.vehicleNumber} onChange={handleChange} placeholder="WP CAB-1234" required disabled={isSubmitting} />
                </div>
                <div className="form-group">
                  <label>VEHICLE MODEL</label>
                  <input type="text" name="vehicleModel" value={formData.vehicleModel} onChange={handleChange} placeholder="Porsche 911 GT3" required disabled={isSubmitting} />
                </div>
              </div>
            </div>

            {/* 3 & 4. SERVICE INFO and APPOINTMENT - side by side */}
            <div className="form-grid cols-2-split">
              <div className="form-section">
                <h4 className="section-title">
                  <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                  SERVICE INFO
                </h4>
                <div className="form-group">
                  <label>SERVICE TYPE</label>
                  <select name="serviceId" value={formData.serviceId} onChange={handleChange} required disabled={isSubmitting || servicesLoading}>
                    {servicesLoading ? <option value="">Loading services...</option> : null}
                    {serviceOptions.map((svc) => (
                      <option key={svc._id} value={svc._id}>{svc.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-section">
                <h4 className="section-title">
                  <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                  APPOINTMENT
                </h4>
                <div className="form-group">
                  <label>DATE</label>
                  <input type="date" name="preferredDate" value={formData.preferredDate} onChange={handleChange} required min={new Date().toISOString().split('T')[0]} disabled={isSubmitting} />
                </div>
                <div className="form-group" style={{ marginTop: '16px' }}>
                  <label>AVAILABLE TIME SLOTS</label>
                  {slotsLoading ? (
                    <div style={{ color: '#6A5C7A', fontSize: '12px' }}>Checking availability...</div>
                  ) : availableSlots.length > 0 ? (
                    <div className="time-slot-grid" style={{ marginBottom: '0' }}>
                      {availableSlots.map(slot => (
                        <div 
                          key={slot.startTime}
                          className={`time-pill ${selectedTimeSlot === slot.startTime ? 'active' : ''}`}
                          onClick={() => !isSubmitting && setSelectedTimeSlot(slot.startTime)}
                          style={{ cursor: isSubmitting ? 'not-allowed' : 'pointer' }}
                        >
                          {formatTime12h(slot.startTime)}
                        </div>
                      ))}
                    </div>
                  ) : formData.serviceId && formData.preferredDate ? (
                    <div style={{ color: '#E11D48', fontSize: '12px' }}>No availability found.</div>
                  ) : (
                    <div style={{ color: '#6A5C7A', fontSize: '12px' }}>Select date to view slots.</div>
                  )}
                </div>
              </div>
            </div>

            {/* INTERNAL ADMIN NOTE */}
            <div className="form-section internal-admin-box" style={{ marginTop: '24px', padding: '16px', background: '#F8F7FA', borderRadius: '8px' }}>
              <h4 className="section-title" style={{ fontSize: '12px', marginBottom: '8px' }}>
                <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ width: '16px', height: '16px', marginRight: '6px' }}><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                INTERNAL ADMINISTRATION
              </h4>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <label style={{ fontSize: '10px', color: '#E9E3EC', fontWeight: 'bold', display: 'block' }}>INITIAL STATUS</label>
                  <span style={{ fontSize: '13px', fontWeight: '600', color: '#0F0519' }}>Request Pending</span>
                </div>
                <div style={{ fontSize: '11px', color: '#6A5C7A', fontStyle: 'italic' }}>
                  Status can be updated manually after creation from Manage Bookings.
                </div>
              </div>
            </div>

          </div>
          
          <div className="global-modal-footer">
            <button type="button" className="btn-modal-cancel" onClick={onClose} disabled={isSubmitting}>Cancel</button>
            <button type="submit" className="btn-modal-create" disabled={isSubmitting}>
              {isSubmitting ? 'Creating Booking...' : 'Create Booking'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
