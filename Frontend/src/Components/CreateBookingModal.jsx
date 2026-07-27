import React, { useState, useEffect } from 'react';

// Default service categories (fallback if not loaded from categories page)
const defaultServiceCategories = [
  { title: 'Full Vehicle Service', active: true },
  { title: 'Engine Diagnostics', active: true },
  { title: 'Brake Optimization', active: true },
  { title: 'General Service', active: true },
  { title: 'Oil Change', active: true },
];

export default function CreateBookingModal({ isOpen, onClose, initialDate, onBookingCreated }) {
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
  const [isCustomTime, setIsCustomTime] = useState(false);
  const [customTimeValue, setCustomTimeValue] = useState('');
  const [serviceOptions, setServiceOptions] = useState([]);
  
  const [formData, setFormData] = useState({
    customerName: "",
    phoneNumber: "",
    emailAddress: "",
    vehicleNumber: "",
    vehicleModel: "",
    serviceType: "",
    preferredDate: "",
    notes: "",
    status: "Request Pending",
    adminNote: ""
  });

  // Load active service categories
  useEffect(() => {
    if (isOpen) {
      // Try to load from localStorage (if service categories were saved)
      const storedCategories = localStorage.getItem('vehiclecare_service_categories');
      let categories;
      if (storedCategories) {
        try {
          categories = JSON.parse(storedCategories).filter(c => c.active);
        } catch (e) {
          categories = defaultServiceCategories.filter(c => c.active);
        }
      } else {
        categories = defaultServiceCategories.filter(c => c.active);
      }
      
      setServiceOptions(categories);

      // Reset form
      setSelectedTimeSlot('');
      setIsCustomTime(false);
      setCustomTimeValue('');
      setFormData({
        customerName: "",
        phoneNumber: "",
        emailAddress: "",
        vehicleNumber: "",
        vehicleModel: "",
        serviceType: categories.length > 0 ? categories[0].title : "",
        preferredDate: initialDate || "",
        notes: "",
        status: "Request Pending",
        adminNote: ""
      });
    }
  }, [isOpen, initialDate]);

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

  const handleCreateBooking = (e) => {
    e.preventDefault();

    if (!formData.customerName.trim()) {
      alert("Please enter the customer name.");
      return;
    }
    if (!formData.phoneNumber.trim()) {
      alert("Please enter the phone number.");
      return;
    }
    if (!formData.vehicleNumber.trim()) {
      alert("Please enter the vehicle number.");
      return;
    }
    if (!formData.vehicleModel.trim()) {
      alert("Please enter the vehicle model.");
      return;
    }
    if (!formData.preferredDate) {
      alert("Please select a booking date.");
      return;
    }
    if (!selectedTimeSlot && (!isCustomTime || !customTimeValue)) {
      alert("Please select or enter a booking time.");
      return;
    }
    
    // Booking Rules Validation
    const rulesStr = localStorage.getItem('vehiclecare_booking_rules');
    if (rulesStr) {
      const rules = JSON.parse(rulesStr);
      const selectedDate = new Date(formData.preferredDate);
      selectedDate.setHours(0,0,0,0);
      
      const today = new Date();
      today.setHours(0,0,0,0);

      if (selectedDate.getTime() === today.getTime() && !rules.allowSameDay) {
        alert("Same-day bookings are not allowed. Please select a future date.");
        return;
      }

      const daysOfWeekStr = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
      if (rules.closedDays && rules.closedDays.includes(daysOfWeekStr[selectedDate.getDay()])) {
        alert(`We are closed on this day. Please select another date.`);
        return;
      }

      const diffDays = Math.ceil((selectedDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays > rules.advanceBookingDays) {
        alert(`You can only book up to ${rules.advanceBookingDays} days in advance.`);
        return;
      }
      if (diffDays < 0) {
        alert(`Cannot book in the past.`);
        return;
      }

      const existingBookings = JSON.parse(localStorage.getItem('vehiclecare_mock_bookings') || '[]');
      const dateCount = existingBookings.filter(b => b.preferredDate === formData.preferredDate).length;
      if (dateCount >= rules.maxBookingsPerDay) {
        alert("Maximum booking capacity has been reached for this date.");
        return;
      }
    }

    const newBooking = { 
      ...formData, 
      id: `VSB-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(5, '0')}`,
      preferredTime: selectedTimeSlot || customTimeValue,
      createdAt: new Date().toISOString()
    };

    const existingBookings = JSON.parse(localStorage.getItem('vehiclecare_mock_bookings') || '[]');
    existingBookings.push(newBooking);
    localStorage.setItem('vehiclecare_mock_bookings', JSON.stringify(existingBookings));

    // Dispatch global event so calendar and other pages can react
    window.dispatchEvent(new Event('bookings_updated'));

    if (onBookingCreated) {
      onBookingCreated(newBooking);
    }
    onClose();
  };

  const timeSlots = ['09:00 AM', '10:30 AM', '12:00 PM', '01:30 PM', '03:00 PM', '04:30 PM'];

  return (
    <div className="global-modal-overlay" onClick={onClose}>
      <div className="global-modal-container manual-booking-modal" onClick={e => e.stopPropagation()}>
        <div className="global-modal-header">
          <div>
            <h2>Create New Booking</h2>
            <p>Enter customer and vehicle details for the new service request.</p>
          </div>
          <button className="global-modal-close" onClick={onClose} type="button">
            <svg fill="currentColor" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
          </button>
        </div>
        
        <form className="global-modal-form" onSubmit={handleCreateBooking}>
          <div className="booking-form-scrollable">
            
            {/* 1. CUSTOMER INFORMATION */}
            <div className="form-section">
              <h4 className="section-title">
                <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                CUSTOMER INFORMATION
              </h4>
              <div className="form-grid cols-3">
                <div className="form-group">
                  <label>FULL NAME</label>
                  <input type="text" name="customerName" value={formData.customerName} onChange={handleChange} placeholder="e.g. Isuru Perera" required />
                </div>
                <div className="form-group">
                  <label>PHONE NUMBER</label>
                  <input type="text" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} placeholder="078-1234567" required />
                </div>
                <div className="form-group">
                  <label>EMAIL ADDRESS</label>
                  <input type="email" name="emailAddress" value={formData.emailAddress} onChange={handleChange} placeholder="isuru@example.com" />
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
                  <input type="text" name="vehicleNumber" value={formData.vehicleNumber} onChange={handleChange} placeholder="WP CAB-1234" required />
                </div>
                <div className="form-group">
                  <label>VEHICLE MODEL</label>
                  <input type="text" name="vehicleModel" value={formData.vehicleModel} onChange={handleChange} placeholder="Porsche 911 GT3" required />
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
                  <select name="serviceType" value={formData.serviceType} onChange={handleChange} required>
                    {serviceOptions.map((svc, idx) => (
                      <option key={idx} value={svc.title}>{svc.title}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group" style={{ marginTop: '16px' }}>
                  <label>NOTES</label>
                  <textarea name="notes" value={formData.notes} onChange={handleChange} placeholder="Mention any specific issues or special requests..." rows="4"></textarea>
                </div>
              </div>

              <div className="form-section">
                <h4 className="section-title">
                  <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                  APPOINTMENT
                </h4>
                <div className="form-group">
                  <label>DATE</label>
                  <input type="date" name="preferredDate" value={formData.preferredDate} onChange={handleChange} required />
                </div>
                <div className="form-group" style={{ marginTop: '16px' }}>
                  <label>TIME SLOT</label>
                  <div className="time-slot-grid" style={{ marginBottom: isCustomTime ? '16px' : '0' }}>
                    {timeSlots.map(time => (
                      <div 
                        key={time}
                        className={`time-pill ${selectedTimeSlot === time && !isCustomTime ? 'active' : ''}`}
                        onClick={() => {
                          setSelectedTimeSlot(time);
                          setIsCustomTime(false);
                          setCustomTimeValue('');
                        }}
                      >
                        {time}
                      </div>
                    ))}
                    <div 
                      className={`time-pill custom-time-btn ${isCustomTime ? 'active' : ''}`}
                      onClick={() => {
                        setIsCustomTime(true);
                        setSelectedTimeSlot('');
                      }}
                    >
                      Custom Time
                    </div>
                  </div>
                  
                  {isCustomTime && (
                    <div className="form-group">
                      <label>CUSTOM TIME</label>
                      <input 
                        type="time" 
                        style={{ padding: '10px 14px' }}
                        value={customTimeValue} 
                        onChange={(e) => setCustomTimeValue(e.target.value)} 
                        required 
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 5. INTERNAL ADMINISTRATION */}
            <div className="form-section internal-admin-box">
              <h4 className="section-title">
                <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                INTERNAL ADMINISTRATION
              </h4>
              <div className="form-grid cols-2">
                <div className="form-group">
                  <label>BOOKING STATUS</label>
                  <select name="status" value={formData.status} onChange={handleChange} required>
                    <option value="Request Pending">Request Pending</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Approved">Approved</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>ADMIN NOTE</label>
                  <input type="text" name="adminNote" value={formData.adminNote} onChange={handleChange} placeholder="Visible to staff only..." />
                </div>
              </div>
            </div>

          </div>
          
          <div className="global-modal-footer">
            <button type="button" className="btn-modal-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-modal-create">Create Booking</button>
          </div>
        </form>
      </div>
    </div>
  );
}
