import React, { useState, useEffect } from 'react';

const defaultContactData = {
  locationName: "VehicleCare Headquarters",
  address: "123 Engine Street, NY 10001",
  phone: "+1 234 567 8900",
  email: "support@vehiclecare.com",
  supportDays: "Mon - Sun",
  businessHours: "09:00 AM - 05:00 PM",
  mapEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d193595.1583091352!2d-74.11976373946234!3d40.69766374859258!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c24fa5d33f083b%3A0xc80b8f06e177fe62!2sNew%20York%2C%20NY%2C%20USA!5e0!3m2!1sen!2s",
  directionsUrl: "https://maps.google.com/?q=123+Engine+Street,+NY+10001"
};

export default function AdminContactLocationSettings() {
  const [formData, setFormData] = useState(defaultContactData);
  const [showToast, setShowToast] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const saved = localStorage.getItem('vehiclecare_contact_location');
    if (saved) {
      try {
        setFormData(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse settings", e);
      }
    }
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

  const handleSaveChanges = () => {
    if (validate()) {
      localStorage.setItem('vehiclecare_contact_location', JSON.stringify(formData));
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  const isValidEmbed = formData.mapEmbedUrl && formData.mapEmbedUrl.includes('google.com/maps/embed');

  return (
    <div className="manage-about-container"> {/* Using existing parent class for shared layout styles */}
      
      {/* 1. BUSINESS INFORMATION */}
      <div className="manage-section-card">
        <h3>Business Information</h3>
        <div className="settings-form-grid cols-1">
          <div className="settings-form-group">
            <label>LOCATION NAME</label>
            <input 
              type="text" 
              name="locationName" 
              value={formData.locationName} 
              onChange={handleChange} 
              placeholder="e.g. VehicleCare Headquarters"
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
            />
          </div>
          <div className="settings-form-group">
            <label>SUPPORT DAYS</label>
            <input 
              type="text" 
              name="supportDays" 
              value={formData.supportDays} 
              onChange={handleChange} 
              placeholder="e.g. Mon - Sun"
            />
          </div>
          <div className="settings-form-group">
            <label>BUSINESS HOURS</label>
            <input 
              type="text" 
              name="businessHours" 
              value={formData.businessHours} 
              onChange={handleChange} 
              placeholder="e.g. 09:00 AM - 05:00 PM"
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
          ) : formData.mapEmbedUrl ? (
            <p style={{color: '#A89CAE', fontSize: '14px'}}>Unable to preview this map.</p>
          ) : (
            <p style={{color: '#A89CAE', fontSize: '14px'}}>Enter a Google Maps Embed URL to preview the location.</p>
          )}
        </div>
      </div>

      <div className="manage-about-footer">
        <button className="btn-save-changes" onClick={handleSaveChanges}>Save Changes</button>
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
