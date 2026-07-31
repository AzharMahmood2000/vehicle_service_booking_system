import React, { useState, useEffect } from 'react';
import API_BASE_URL from '../../api';

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const slotIntervalOptions = [
  { value: 15, label: '15 Minutes' },
  { value: 30, label: '30 Minutes' },
  { value: 45, label: '45 Minutes' },
  { value: 60, label: '60 Minutes' },
];

export default function AdminBookingRules() {
  const [formData, setFormData] = useState({
    openingTime: '09:00',
    closingTime: '17:00',
    slotIntervalMins: 30,
    closedDays: [],
    allowSameDay: false,
    advanceBookingDays: 30,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState(false);

  const getToken = () => {
    return localStorage.getItem('vehiclecare_admin_token') ||
      sessionStorage.getItem('vehiclecare_admin_token');
  };

  // Fetch current booking rules from MongoDB on mount
  useEffect(() => {
    const fetchRules = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await fetch(`${API_BASE_URL}/settings/booking_rules`);
        const data = await response.json();

        if (response.ok && data.success && data.setting && data.setting.value) {
          const saved = data.setting.value;
          setFormData(prev => ({
            ...prev,
            openingTime: saved.openingTime || prev.openingTime,
            closingTime: saved.closingTime || prev.closingTime,
            slotIntervalMins: saved.slotIntervalMins ?? prev.slotIntervalMins,
            closedDays: Array.isArray(saved.closedDays) ? saved.closedDays : prev.closedDays,
            allowSameDay: typeof saved.allowSameDay === 'boolean' ? saved.allowSameDay : prev.allowSameDay,
            advanceBookingDays: saved.advanceBookingDays ?? prev.advanceBookingDays,
          }));
        }
        // If 404, no rules saved yet — default form values are fine
      } catch (err) {
        console.error('Failed to load booking rules:', err);
        setError('Failed to load booking rules from server.');
      } finally {
        setLoading(false);
      }
    };

    fetchRules();
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
    } else if (name === 'slotIntervalMins' || name === 'advanceBookingDays') {
      setFormData(p => ({ ...p, [name]: Number(value) }));
    } else {
      setFormData(p => ({ ...p, [name]: value }));
    }
  };

  const handleSaveRules = async (e) => {
    e.preventDefault();
    setError('');

    // Frontend validation
    if (formData.openingTime >= formData.closingTime) {
      setError('Opening time must be before closing time.');
      return;
    }

    const advDays = Number(formData.advanceBookingDays);
    if (!advDays || advDays < 1 || advDays > 365) {
      setError('Maximum advance booking days must be between 1 and 365.');
      return;
    }

    if (!slotIntervalOptions.some(opt => opt.value === Number(formData.slotIntervalMins))) {
      setError('Invalid slot interval value.');
      return;
    }

    setSaving(true);

    try {
      const token = getToken();
      const response = await fetch(`${API_BASE_URL}/settings/booking_rules`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          value: {
            openingTime: formData.openingTime,
            closingTime: formData.closingTime,
            slotIntervalMins: Number(formData.slotIntervalMins),
            closedDays: formData.closedDays,
            allowSameDay: formData.allowSameDay,
            advanceBookingDays: advDays,
          }
        })
      });

      const data = await response.json();

      if (response.status === 401) {
        setError('Session expired. Please log in again.');
        return;
      }

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to update booking rules.');
      }

      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Something went wrong saving booking rules.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="settings-card-container">
        <div style={{ padding: '40px', textAlign: 'center', color: '#6B7280' }}>
          Loading booking rules...
        </div>
      </div>
    );
  }

  return (
    <div className="settings-card-container">
      <div className="security-header" style={{ marginBottom: '24px' }}>
        <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: '#111827' }}>Booking Rules</h3>
        <p style={{ margin: '8px 0 0 0', color: '#6B7280', fontSize: '14px' }}>Control the main booking limitations and availability rules.</p>
      </div>

      {error && (
        <div style={{ backgroundColor: 'rgba(225,29,72,0.08)', color: '#E11D48', padding: '12px 16px', borderRadius: '6px', marginBottom: '20px', fontWeight: '600', fontSize: '13px' }}>
          ⚠ {error}
        </div>
      )}

      <form className="settings-form" onSubmit={handleSaveRules} style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        
        {/* Working Hours */}
        <div style={{ paddingBottom: '24px', borderBottom: '1px solid #E5E7EB' }}>
          <label style={{ fontSize: '11px', fontWeight: '800', color: '#4B5563', letterSpacing: '0.5px', textTransform: 'uppercase', display: 'block', marginBottom: '16px' }}>WORKING HOURS</label>
          <div className="settings-form-grid cols-2" style={{ maxWidth: '600px' }}>
            <div className="settings-form-group">
              <label>OPENING TIME</label>
              <input type="time" name="openingTime" value={formData.openingTime} onChange={handleChange} required disabled={saving} />
            </div>
            <div className="settings-form-group">
              <label>CLOSING TIME</label>
              <input type="time" name="closingTime" value={formData.closingTime} onChange={handleChange} required disabled={saving} />
            </div>
          </div>
          <span style={{ fontSize: '12px', color: '#6B7280', display: 'block', marginTop: '12px' }}>
            Customers can only select booking times within the configured working hours.
          </span>
        </div>

        {/* Booking Slot Interval */}
        <div style={{ paddingBottom: '24px', borderBottom: '1px solid #E5E7EB' }}>
          <div className="settings-form-group" style={{ maxWidth: '400px' }}>
            <label>BOOKING SLOT INTERVAL</label>
            <select name="slotIntervalMins" value={formData.slotIntervalMins} onChange={handleChange} required disabled={saving}>
              {slotIntervalOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <span style={{ fontSize: '12px', color: '#6B7280', marginTop: '4px' }}>
              Controls the time interval between available booking slots.
            </span>
          </div>
        </div>

        {/* Closed Days */}
        <div style={{ paddingBottom: '24px', borderBottom: '1px solid #E5E7EB' }}>
          <label style={{ fontSize: '11px', fontWeight: '800', color: '#4B5563', letterSpacing: '0.5px', textTransform: 'uppercase', display: 'block', marginBottom: '16px' }}>CLOSED DAYS</label>
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            {daysOfWeek.map(day => (
              <label key={day} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#111827', cursor: saving ? 'not-allowed' : 'pointer' }}>
                <input 
                  type="checkbox" 
                  name={day} 
                  checked={formData.closedDays.includes(day)} 
                  onChange={handleChange}
                  disabled={saving}
                  style={{ width: '16px', height: '16px', cursor: saving ? 'not-allowed' : 'pointer', accentColor: '#FF1E89' }}
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
          <label style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px', color: '#111827', fontWeight: '600', cursor: saving ? 'not-allowed' : 'pointer' }}>
            <input 
              type="checkbox" 
              name="allowSameDay" 
              checked={formData.allowSameDay}
              onChange={handleChange}
              disabled={saving}
              style={{ width: '18px', height: '18px', cursor: saving ? 'not-allowed' : 'pointer', accentColor: '#FF1E89' }}
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
              disabled={saving}
            />
            <span style={{ fontSize: '12px', color: '#6B7280', marginTop: '4px' }}>
              Set how many days in advance customers can schedule a booking.
            </span>
          </div>
        </div>

        <div className="settings-form-actions" style={{ marginTop: '0', paddingTop: '24px', borderTop: '1px solid #F3F4F6' }}>
          <button className="btn-save-changes" type="submit" disabled={saving}>
            {saving ? 'Saving...' : 'Save Booking Rules'}
          </button>
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
