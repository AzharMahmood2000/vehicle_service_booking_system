import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from '../../api';

const defaultContactData = {
  locationName: "VehicleCare Headquarters",
  address: "123 Engine Street, NY 10001",
  phone: "078-7898098",
  email: "support@vehiclecare.com",
  mapEmbedUrl: "",
  directionsUrl: "",
  facebookUrl: "",
  instagramUrl: "",
  linkedinUrl: ""
};

export default function AdminContactLocationSettings() {
  const navigate = useNavigate();

  const handleAuthFailure = useCallback(() => {
    localStorage.removeItem('vehiclecare_admin_token');
    localStorage.removeItem('vehiclecare_admin');
    sessionStorage.removeItem('vehiclecare_admin_token');
    sessionStorage.removeItem('vehiclecare_admin');
    alert("Session expired. Please log in again.");
    navigate('/admin-login');
  }, [navigate]);

  const isSubmittingRef = useRef(false);

  const [formData, setFormData] = useState(defaultContactData);
  const [showToast, setShowToast] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const getToken = () => {
    return localStorage.getItem('vehiclecare_admin_token') ||
      sessionStorage.getItem('vehiclecare_admin_token');
  };

  useEffect(() => {
    const fetchContactData = async () => {
      try {
        setLoading(true);
        setErrorMsg('');
        const response = await fetch(`${API_BASE_URL}/settings/contact_info`);
        const result = await response.json();
        if (response.ok && result.success && result.setting && result.setting.value) {
          const loadedData = result.setting.value;
          setFormData({
            locationName: loadedData.locationName || defaultContactData.locationName,
            address: loadedData.address || defaultContactData.address,
            phone: loadedData.phone || defaultContactData.phone,
            email: loadedData.email || defaultContactData.email,
            mapEmbedUrl: loadedData.mapEmbedUrl || defaultContactData.mapEmbedUrl,
            directionsUrl: loadedData.directionsUrl || defaultContactData.directionsUrl,
            facebookUrl: loadedData.facebookUrl || defaultContactData.facebookUrl,
            instagramUrl: loadedData.instagramUrl || defaultContactData.instagramUrl,
            linkedinUrl: loadedData.linkedinUrl || defaultContactData.linkedinUrl
          });
        } else {
          // Empty initial UI fallback (do not forcefully write to NY default values automatically)
          setFormData({
            locationName: "",
            address: "",
            phone: "",
            email: "",
            mapEmbedUrl: "",
            directionsUrl: "",
            facebookUrl: "",
            instagramUrl: "",
            linkedinUrl: ""
          });
        }
      } catch (e) {
        console.error("Failed to fetch contact settings", e);
        setErrorMsg('Failed to load contact settings from backend.');
      } finally {
        setLoading(false);
      }
    };
    fetchContactData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: null }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.locationName.trim()) newErrors.locationName = "Location Name is required";
    if (!formData.address.trim()) newErrors.address = "Address is required";
    if (!formData.phone.trim()) newErrors.phone = "Phone Number is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveChanges = async () => {
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;

    try {
      if (!validate()) return;
      
      setIsSubmitting(true);
      setErrorMsg('');

      const token = getToken();
      if (!token) {
        handleAuthFailure();
        return;
      }
      const response = await fetch(`${API_BASE_URL}/settings/contact_info`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ value: formData })
      });

      const data = await response.json();

      if (response.status === 401) {
        handleAuthFailure();
        return;
      }

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Unable to update contact settings. Please try again.');
      }

      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (e) {
      console.error(e);
      setErrorMsg(e.message || 'Unable to update contact settings. Please try again.');
    } finally {
      isSubmittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  // Safe validity checking for Google maps
  const isValidEmbed = formData.mapEmbedUrl && formData.mapEmbedUrl.startsWith('https://www.google.com/maps/embed');

  if (loading) {
    return (
      <div className="manage-about-container">
        <div style={{ padding: '40px', textAlign: 'center', color: '#6B7280' }}>
          Loading Contact & Location settings...
        </div>
      </div>
    );
  }

  return (
    <div className="manage-about-container"> {/* Using existing parent class for shared layout styles */}
      
      {errorMsg && (
        <div style={{ backgroundColor: 'rgba(225,29,72,0.08)', color: '#E11D48', padding: '12px 16px', borderRadius: '6px', marginBottom: '20px', fontWeight: '600', fontSize: '13px' }}>
          ⚠ {errorMsg}
        </div>
      )}

      {/* 1. BUSINESS INFORMATION */}
      <div className="manage-section-card">
        <h3>Business Information</h3>
        <p style={{fontSize: '12px', color: '#6B7280', marginBottom: '16px'}}>Note: Business Hours are automatically derived from your active Booking Rules schedule.</p>
        <div className="settings-form-grid cols-1">
          <div className="settings-form-group">
            <label>LOCATION NAME</label>
            <input 
              type="text" 
              name="locationName" 
              value={formData.locationName} 
              onChange={handleChange} 
              placeholder="e.g. VehicleCare Headquarters"
              disabled={isSubmitting}
            />
            {errors.locationName && <span style={{color: '#ff107a', fontSize: '12px'}}>{errors.locationName}</span>}
          </div>
          <div className="settings-form-group">
            <label>BUSINESS ADDRESS</label>
            <input 
              type="text" 
              name="address" 
              value={formData.address} 
              onChange={handleChange} 
              placeholder="e.g. 123 Engine Street, NY 10001"
              disabled={isSubmitting}
            />
            {errors.address && <span style={{color: '#ff107a', fontSize: '12px'}}>{errors.address}</span>}
          </div>
        </div>

        <div className="settings-form-grid cols-2" style={{marginTop: '20px'}}>
          <div className="settings-form-group">
            <label>PHONE NUMBER</label>
            <input 
              type="text" 
              name="phone" 
              value={formData.phone} 
              onChange={handleChange} 
              placeholder="e.g. +1 234 567 8900"
              disabled={isSubmitting}
            />
            {errors.phone && <span style={{color: '#ff107a', fontSize: '12px'}}>{errors.phone}</span>}
          </div>
          <div className="settings-form-group">
            <label>CONTACT EMAIL</label>
            <input 
              type="email" 
              name="email" 
              value={formData.email} 
              onChange={handleChange} 
              placeholder="e.g. support@vehiclecare.com"
              disabled={isSubmitting}
            />
          </div>
        </div>
      </div>

      {/* 2. MAP CONFIGURATION */}
      <div className="manage-section-card">
        <h3>Map Configuration</h3>
        <div className="settings-form-grid cols-1">
          <div className="settings-form-group">
            <label>GOOGLE MAPS EMBED URL</label>
            <input 
              type="text" 
              name="mapEmbedUrl" 
              value={formData.mapEmbedUrl} 
              onChange={handleChange} 
              placeholder="e.g. https://www.google.com/maps/embed?..."
              disabled={isSubmitting}
            />
            <p style={{fontSize: '12px', color: '#A89CAE', marginTop: '4px'}}>Paste the Google Maps embed URL used to display the map.</p>
          </div>
          
          <div className="settings-form-group">
            <label>GOOGLE MAPS DIRECTIONS URL</label>
            <input 
              type="text" 
              name="directionsUrl" 
              value={formData.directionsUrl} 
              onChange={handleChange} 
              placeholder="e.g. https://maps.google.com/?q=..."
              disabled={isSubmitting}
            />
            <p style={{fontSize: '12px', color: '#A89CAE', marginTop: '4px'}}>Paste the Google Maps location or directions link.</p>
          </div>
        </div>

        <div className="section-header-flex" style={{ marginTop: '30px', borderTop: '1px solid #E5E7EB', paddingTop: '20px' }}>
          <h4>Map Preview</h4>
        </div>
        <div style={{width: '100%', minHeight: '300px', backgroundColor: '#150F19', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden'}}>
          {isValidEmbed ? (
            <iframe
              title="Map Preview"
              src={formData.mapEmbedUrl}
              width="100%"
              height="300"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          ) : (
            <p style={{color: '#A89CAE', fontSize: '14px'}}>Unable to preview this map.</p>
          )}
        </div>
      </div>

      {/* 3. SOCIAL MEDIA LINKS */}
      <div className="manage-section-card">
        <h3>Social Media Links</h3>
        <div className="settings-form-grid cols-1">
          <div className="settings-form-group">
            <label>FACEBOOK URL</label>
            <input 
              type="url" 
              name="facebookUrl" 
              value={formData.facebookUrl} 
              onChange={handleChange} 
              placeholder="https://facebook.com/your-page"
              disabled={isSubmitting}
            />
          </div>
          <div className="settings-form-group">
            <label>INSTAGRAM URL</label>
            <input 
              type="url" 
              name="instagramUrl" 
              value={formData.instagramUrl} 
              onChange={handleChange} 
              placeholder="https://instagram.com/your-page"
              disabled={isSubmitting}
            />
          </div>
          <div className="settings-form-group">
            <label>LINKEDIN URL</label>
            <input 
              type="url" 
              name="linkedinUrl" 
              value={formData.linkedinUrl} 
              onChange={handleChange} 
              placeholder="https://linkedin.com/company/your-page"
              disabled={isSubmitting}
            />
          </div>
        </div>
      </div>

      <div className="manage-about-footer">
        <button className="btn-save-changes" onClick={handleSaveChanges} disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Success Toast */}
      {showToast && (
        <div className="success-toast">
          <div className="toast-icon">
            <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg>
          </div>
          <div className="toast-content">
            <h4>Settings Saved</h4>
            <p>Contact and location settings updated successfully.</p>
          </div>
        </div>
      )}
    </div>
  );
}
