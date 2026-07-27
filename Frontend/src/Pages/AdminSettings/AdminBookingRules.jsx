import React, { useState, useEffect } from 'react';

const defaultBookingRules = {
  maxBookingsPerDay: 20,
  openingTime: '08:00',
  closingTime: '18:00',
  closedDays: ['Sunday'], // Array of closed days
  allowSameDay: false,
  advanceBookingDays: 30
};

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function AdminBookingRules() {
  const [formData, setFormData] = useState(defaultBookingRules);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('vehiclecare_booking_rules');
    if (saved) {
      setFormData(JSON.parse(saved));
    } else {
      localStorage.setItem('vehiclecare_booking_rules', JSON.stringify(defaultBookingRules));
    }
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox' && name === 'allowSameDay') {
      setFormData(p => ({ ...p, allowSameDay: checked }));
    } else if (type === 'checkbox' && daysOfWeek.includes(name)) {
      setFormData(p => {
        const newClosedDays = checked 
          ? [...p.closedDays, name] 
          : p.closedDays.filter(d => d !== name);
        return { ...p, closedDays: newClosedDays };
      });
    } else {
      setFormData(p => ({ ...p, [name]: value }));
    }
  };

  const handleSaveRules = (e) => {
    e.preventDefault();
    localStorage.setItem('vehiclecare_booking_rules', JSON.stringify({
      ...formData,
      maxBookingsPerDay: Number(formData.maxBookingsPerDay),
      advanceBookingDays: Number(formData.advanceBookingDays)
    }));
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <div className="settings-card-container">
      <div className="security-header" style={{ marginBottom: '24px' }}>
        <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: '#111827' }}>Booking Rules</h3>
        <p style={{ margin: '8px 0 0 0', color: '#6B7280', fontSize: '14px' }}>Control the main booking limitations and availability rules.</p>
      </div>

      <form className="settings-form" onSubmit={handleSaveRules} style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        
        {/* Maximum Bookings Per Day */}
        <div style={{ paddingBottom: '24px', borderBottom: '1px solid #E5E7EB' }}>
          <div className="settings-form-group" style={{ maxWidth: '400px' }}>
            <label>MAXIMUM BOOKINGS PER DAY</label>
            <input 
              type="number" 
              name="maxBookingsPerDay" 
              value={formData.maxBookingsPerDay} 
              onChange={handleChange} 
              min="1" 
              max="100" 
              required 
            />
            <span style={{ fontSize: '12px', color: '#6B7280', marginTop: '4px' }}>
              Set the maximum number of customer bookings that can be accepted for a single day.
            </span>
          </div>
        </div>

        {/* Working Hours */}
        <div style={{ paddingBottom: '24px', borderBottom: '1px solid #E5E7EB' }}>
          <label style={{ fontSize: '11px', fontWeight: '800', color: '#4B5563', letterSpacing: '0.5px', textTransform: 'uppercase', display: 'block', marginBottom: '16px' }}>WORKING HOURS</label>
          <div className="settings-form-grid cols-2" style={{ maxWidth: '600px' }}>
            <div className="settings-form-group">
              <label>OPENING TIME</label>
              <input type="time" name="openingTime" value={formData.openingTime} onChange={handleChange} required />
            </div>
            <div className="settings-form-group">
              <label>CLOSING TIME</label>
              <input type="time" name="closingTime" value={formData.closingTime} onChange={handleChange} required />
            </div>
          </div>
          <span style={{ fontSize: '12px', color: '#6B7280', display: 'block', marginTop: '12px' }}>
            Customers can only select booking times within the configured working hours.
          </span>
        </div>

        {/* Closed Days */}
        <div style={{ paddingBottom: '24px', borderBottom: '1px solid #E5E7EB' }}>
          <label style={{ fontSize: '11px', fontWeight: '800', color: '#4B5563', letterSpacing: '0.5px', textTransform: 'uppercase', display: 'block', marginBottom: '16px' }}>CLOSED DAYS</label>
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            {daysOfWeek.map(day => (
              <label key={day} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#111827', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  name={day} 
                  checked={formData.closedDays.includes(day)} 
                  onChange={handleChange}
                  style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#FF1E89' }}
                />
                {day}
              </label>
            ))}
          </div>
          <span style={{ fontSize: '12px', color: '#6B7280', display: 'block', marginTop: '12px' }}>
            Select days of the week when the service center is completely closed.
          </span>
        </div>

        {/* Allow Same-Day Bookings */}
        <div style={{ paddingBottom: '24px', borderBottom: '1px solid #E5E7EB' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px', color: '#111827', fontWeight: '600', cursor: 'pointer' }}>
            <input 
              type="checkbox" 
              name="allowSameDay" 
              checked={formData.allowSameDay}
              onChange={handleChange}
              style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#FF1E89' }}
            />
            Allow Same-Day Booking
          </label>
          <span style={{ fontSize: '12px', color: '#6B7280', display: 'block', marginTop: '8px' }}>
            Allow customers to book a service for the current day.
          </span>
        </div>

        {/* Advance Booking Period */}
        <div style={{ paddingBottom: '24px' }}>
          <div className="settings-form-group" style={{ maxWidth: '400px' }}>
            <label>MAXIMUM ADVANCE BOOKING DAYS</label>
            <input 
              type="number" 
              name="advanceBookingDays" 
              value={formData.advanceBookingDays} 
              onChange={handleChange} 
              min="1" 
              max="365" 
              required 
            />
            <span style={{ fontSize: '12px', color: '#6B7280', marginTop: '4px' }}>
              Set how many days in advance customers can schedule a booking.
            </span>
          </div>
        </div>

        <div className="settings-form-actions" style={{ marginTop: '0', paddingTop: '24px', borderTop: '1px solid #F3F4F6' }}>
          <button className="btn-save-changes" type="submit">Save Booking Rules</button>
        </div>
      </form>

      {/* Success Toast */}
      {showToast && (
        <div className="success-toast">
          <div className="toast-icon">
            <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg>
          </div>
          <div className="toast-content">
            <h4>Booking rules updated successfully.</h4>
            <p>Your availability limitations are now active.</p>
          </div>
        </div>
      )}
    </div>
  );
}
