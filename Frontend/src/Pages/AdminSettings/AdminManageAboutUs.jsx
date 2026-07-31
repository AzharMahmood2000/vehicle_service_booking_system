import React, { useState, useEffect } from 'react';
import API_BASE_URL from '../../api';

const defaultAboutData = {
  hero: {
    subtitle: 'ABOUT OUR JOURNEY',
    title: 'Driven by Quality,\nPowered by Trust',
    description: 'VehicleCare provides reliable, professional, and customer-focused vehicle service solutions that bridge the gap between traditional craftsmanship and modern technology.',
  },
  stats: [
    { id: 1, value: '5000+', label: 'Vehicles Serviced', active: true },
    { id: 2, value: '25+', label: 'Expert Mechanics', active: true },
    { id: 3, value: '15+', label: 'Service Categories', active: true },
    { id: 4, value: '98%', label: 'Customer Satisfaction', active: true },
  ],
  missionVision: {
    missionTitle: 'Our Mission',
    missionDesc: 'To make professional vehicle maintenance simple, transparent, reliable, and easily accessible. We strip away the complexity of automotive repair, providing a seamless digital-first experience.',
    visionTitle: 'Our Vision',
    visionDesc: 'To become a trusted digital platform for modern and efficient vehicle service management, setting the global benchmark for automotive excellence and technological integration.',
    image: '/assets/images/engine-diagnostics.jpg'
  },
  valuesHeader: {
    subtitle: 'THE VEHICLECARE WAY',
    title: 'Our Core Values',
  },
  values: [
    { id: 1, title: 'Quality', description: 'We never compromise on the standards of parts and service delivery.', active: true },
    { id: 2, title: 'Trust', description: 'Building long-term relationships through honesty and transparency.', active: true },
    { id: 3, title: 'Reliability', description: 'Consistent performance that our customers can count on daily.', active: true },
    { id: 4, title: 'Professionalism', description: 'Expertise and conduct that exceeds industry expectations.', active: true },
    { id: 5, title: 'Customer Satisfaction', description: 'Your peace of mind is our ultimate measure of success.', active: true },
    { id: 6, title: 'Innovation', description: 'Leveraging digital tools to redefine vehicle management.', active: true },
  ],
  cta: {
    heading: 'Ready to experience the difference?',
    buttonText: 'Book Your Vehicle Service'
  }
};

export default function AdminManageAboutUs() {
  const [formData, setFormData] = useState(defaultAboutData);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showToast, setShowToast] = useState(false);
  
  const getToken = () => {
    return localStorage.getItem('vehiclecare_admin_token') ||
      sessionStorage.getItem('vehiclecare_admin_token');
  };

  useEffect(() => {
    const fetchAboutData = async () => {
      try {
        setLoading(true);
        setErrorMsg('');
        const response = await fetch(`${API_BASE_URL}/settings/about_content`);
        const data = await response.json();
        if (response.ok && data.success && data.setting && data.setting.value) {
          const loadedData = data.setting.value;
          // Merge deep safely to ensure arrays are array, etc
          setFormData({
            hero: { ...defaultAboutData.hero, ...loadedData.hero },
            stats: Array.isArray(loadedData.stats) ? loadedData.stats : defaultAboutData.stats,
            missionVision: { ...defaultAboutData.missionVision, ...loadedData.missionVision },
            valuesHeader: { ...defaultAboutData.valuesHeader, ...loadedData.valuesHeader },
            values: Array.isArray(loadedData.values) ? loadedData.values : defaultAboutData.values,
            cta: { ...defaultAboutData.cta, ...loadedData.cta }
          });
        }
      } catch (err) {
        console.error(err);
        setErrorMsg('Failed to load About Us content from the server.');
      } finally {
        setLoading(false);
      }
    };
    fetchAboutData();
  }, []);

  const handleHeroChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, hero: { ...prev.hero, [name]: value } }));
  };

  const handleMVChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, missionVision: { ...prev.missionVision, [name]: value } }));
  };

  const handleValuesHeaderChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, valuesHeader: { ...prev.valuesHeader, [name]: value } }));
  };

  const handleCTAChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, cta: { ...prev.cta, [name]: value } }));
  };

  const addStat = () => {
    setFormData(p => ({
      ...p, 
      stats: [...p.stats, { id: Date.now(), value: '', label: '', active: true }]
    }));
  };
  
  const updateStat = (id, field, value) => {
    setFormData(p => ({
      ...p,
      stats: p.stats.map(s => s.id === id ? { ...s, [field]: value } : s)
    }));
  };

  const deleteStat = (id) => {
    if (window.confirm('Are you sure you want to delete this statistic?')) {
      setFormData(p => ({ ...p, stats: p.stats.filter(s => s.id !== id) }));
    }
  };

  const addValue = () => {
    setFormData(p => ({
      ...p,
      values: [...p.values, { id: Date.now(), title: '', description: '', active: true }]
    }));
  };

  const updateValueItem = (id, field, value) => {
    setFormData(p => ({
      ...p,
      values: p.values.map(v => v.id === id ? { ...v, [field]: value } : v)
    }));
  };

  const deleteValueItem = (id) => {
    if (window.confirm('Are you sure you want to delete this value card?')) {
      setFormData(p => ({ ...p, values: p.values.filter(v => v.id !== id) }));
    }
  };

  const handleSaveChanges = async () => {
    if (!formData.hero.title || !formData.hero.description) {
      setErrorMsg("Hero Title and Description cannot be empty.");
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg('');
      const token = getToken();

      const response = await fetch(`${API_BASE_URL}/settings/about_content`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ value: formData })
      });

      const data = await response.json();

      if (response.status === 401) {
        throw new Error('Your session has expired. Please log in again.');
      }

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Unable to update About Us content. Please try again.');
      }

      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (error) {
      console.error(error);
      setErrorMsg(error.message || 'Unable to update About Us content. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="manage-about-container">
        <div style={{ padding: '40px', textAlign: 'center', color: '#6B7280' }}>
          Loading About Us content...
        </div>
      </div>
    );
  }

  return (
    <div className="manage-about-container">
      
      {errorMsg && (
        <div style={{ backgroundColor: 'rgba(225,29,72,0.08)', color: '#E11D48', padding: '12px 16px', borderRadius: '6px', marginBottom: '20px', fontWeight: '600', fontSize: '13px' }}>
          ⚠ {errorMsg}
        </div>
      )}

      {/* 1. HERO SECTION */}
      <div className="manage-section-card">
        <h3>Hero Section</h3>
        <div className="settings-form-grid cols-1">
          <div className="settings-form-group">
            <label>SECTION SUBTITLE</label>
            <input type="text" name="subtitle" value={formData.hero.subtitle} onChange={handleHeroChange} disabled={isSubmitting} />
          </div>
          <div className="settings-form-group">
            <label>MAIN TITLE (Use \n for line breaks)</label>
            <textarea name="title" rows="2" value={formData.hero.title} onChange={handleHeroChange} required disabled={isSubmitting}></textarea>
          </div>
          <div className="settings-form-group">
            <label>DESCRIPTION</label>
            <textarea name="description" rows="3" value={formData.hero.description} onChange={handleHeroChange} required disabled={isSubmitting}></textarea>
          </div>
        </div>
      </div>

      {/* 2. STATISTICS SECTION */}
      <div className="manage-section-card">
        <div className="section-header-flex">
          <h3>Statistics</h3>
          <button className="add-item-btn" onClick={addStat} disabled={isSubmitting}>+ Add Statistic</button>
        </div>
        <div className="repeatable-items-list">
          {formData.stats.map((stat, i) => (
            <div key={stat.id} className="repeatable-item-row">
              <div className="settings-form-group" style={{ flex: '0.3' }}>
                <label>VALUE</label>
                <input type="text" value={stat.value} onChange={(e) => updateStat(stat.id, 'value', e.target.value)} placeholder="e.g. 5000+" disabled={isSubmitting} />
              </div>
              <div className="settings-form-group" style={{ flex: '1' }}>
                <label>LABEL</label>
                <input type="text" value={stat.label} onChange={(e) => updateStat(stat.id, 'label', e.target.value)} placeholder="e.g. Vehicles Serviced" disabled={isSubmitting} />
              </div>
              <div className="item-actions">
                <button 
                  className={`status-toggle ${stat.active ? 'active' : 'hidden'}`}
                  onClick={() => updateStat(stat.id, 'active', !stat.active)}
                  disabled={isSubmitting}
                >
                  {stat.active ? 'Active' : 'Hidden'}
                </button>
                <button className="delete-icon-btn" onClick={() => deleteStat(stat.id)} title="Delete" disabled={isSubmitting}>
                  <svg fill="currentColor" viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12M8 9h8v10H8V9m7.5-5l-1-1h-5l-1 1H5v2h14V4h-3.5z"/></svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. MISSION & VISION SECTION */}
      <div className="manage-section-card">
        <h3>Mission & Vision</h3>
        <div className="settings-form-grid cols-2">
          <div className="settings-form-group">
            <label>MISSION TITLE</label>
            <input type="text" name="missionTitle" value={formData.missionVision.missionTitle} onChange={handleMVChange} disabled={isSubmitting} />
          </div>
          <div className="settings-form-group">
            <label>VISION TITLE</label>
            <input type="text" name="visionTitle" value={formData.missionVision.visionTitle} onChange={handleMVChange} disabled={isSubmitting} />
          </div>
          <div className="settings-form-group">
            <label>MISSION DESCRIPTION</label>
            <textarea name="missionDesc" rows="4" value={formData.missionVision.missionDesc} onChange={handleMVChange} disabled={isSubmitting}></textarea>
          </div>
          <div className="settings-form-group">
            <label>VISION DESCRIPTION</label>
            <textarea name="visionDesc" rows="4" value={formData.missionVision.visionDesc} onChange={handleMVChange} disabled={isSubmitting}></textarea>
          </div>
          <div className="settings-form-group">
            <label>MISSION / VISION IMAGE PATH</label>
            <div className="image-preview-mock">
              <input type="text" name="image" value={formData.missionVision.image} onChange={handleMVChange} style={{ marginBottom: '10px', width: '100%', boxSizing: 'border-box' }} disabled={isSubmitting} />
              <img src={formData.missionVision.image} alt="Preview" style={{ objectFit: 'cover', height: '100px', width: '100%', borderRadius: '4px' }} />
            </div>
          </div>
        </div>
      </div>

      {/* 4. CORE VALUES SECTION */}
      <div className="manage-section-card">
        <div className="section-header-flex">
          <h3>Core Values</h3>
        </div>
        <div className="settings-form-grid cols-2" style={{ marginBottom: '20px' }}>
          <div className="settings-form-group">
            <label>SUBTITLE</label>
            <input type="text" name="subtitle" value={formData.valuesHeader.subtitle} onChange={handleValuesHeaderChange} disabled={isSubmitting} />
          </div>
          <div className="settings-form-group">
            <label>MAIN TITLE</label>
            <input type="text" name="title" value={formData.valuesHeader.title} onChange={handleValuesHeaderChange} disabled={isSubmitting} />
          </div>
        </div>
        
        <div className="section-header-flex" style={{ marginTop: '20px', borderTop: '1px solid #E5E7EB', paddingTop: '20px' }}>
          <h4>Value Cards</h4>
          <button className="add-item-btn" onClick={addValue} disabled={isSubmitting}>+ Add Value Card</button>
        </div>
        <div className="repeatable-items-list grid-layout">
          {formData.values.map(val => (
            <div key={val.id} className="value-card-edit">
              <div className="settings-form-group">
                <label>CARD TITLE</label>
                <input type="text" value={val.title} onChange={(e) => updateValueItem(val.id, 'title', e.target.value)} disabled={isSubmitting} />
              </div>
              <div className="settings-form-group">
                <label>DESCRIPTION</label>
                <textarea rows="2" value={val.description} onChange={(e) => updateValueItem(val.id, 'description', e.target.value)} disabled={isSubmitting}></textarea>
              </div>
              <div className="card-edit-footer">
                <button 
                  className={`status-toggle ${val.active ? 'active' : 'hidden'}`}
                  onClick={() => updateValueItem(val.id, 'active', !val.active)}
                  disabled={isSubmitting}
                >
                  {val.active ? 'Active' : 'Hidden'}
                </button>
                <button className="delete-icon-btn" onClick={() => deleteValueItem(val.id)} disabled={isSubmitting}>
                   <svg fill="currentColor" viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12M8 9h8v10H8V9m7.5-5l-1-1h-5l-1 1H5v2h14V4h-3.5z"/></svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. CTA SECTION */}
      <div className="manage-section-card">
        <h3>Call To Action</h3>
        <div className="settings-form-grid cols-2">
          <div className="settings-form-group">
            <label>HEADING</label>
            <input type="text" name="heading" value={formData.cta.heading} onChange={handleCTAChange} disabled={isSubmitting} />
          </div>
          <div className="settings-form-group">
            <label>BUTTON TEXT</label>
            <input type="text" name="buttonText" value={formData.cta.buttonText} onChange={handleCTAChange} disabled={isSubmitting} />
          </div>
        </div>
      </div>

      <div className="manage-about-footer">
        <a href="/about" target="_blank" rel="noreferrer" className="btn-preview">Preview About Page ↗</a>
        <button className="btn-save-changes" onClick={handleSaveChanges} disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Success Toast */}
      {showToast && (
        <div className="success-toast">
          <div className="toast-icon">
            <svg fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/></svg>
          </div>
          <div className="toast-content">
            <h4>About Us Content Updated</h4>
            <p>Your modifications are now live on the public page.</p>
          </div>
        </div>
      )}
    </div>
  );
}
