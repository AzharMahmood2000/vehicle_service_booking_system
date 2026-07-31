import React, { useState } from 'react';
import API_BASE_URL from '../../api';

export default function AdminSecuritySettings() {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getToken = () => {
    return localStorage.getItem('vehiclecare_admin_token') ||
      sessionStorage.getItem('vehiclecare_admin_token');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(p => ({ ...p, [name]: value }));
    setErrorMsg(''); // Clear error on typing
    setSuccessMsg('');
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!formData.currentPassword) {
      setErrorMsg('Please enter your current password.');
      return;
    }
    
    if (formData.newPassword.length < 8) {
      setErrorMsg('New password must be at least 8 characters.');
      return;
    }

    if (formData.newPassword === formData.currentPassword) {
      setErrorMsg('New password cannot be the same as your current password.');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);

    try {
      const token = getToken();
      if (!token) {
        throw new Error('Your session has expired. Please log in again.');
      }

      const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        })
      });

      const data = await response.json();

      if (response.status === 401) {
        throw new Error('Your session has expired. Please log in again.');
      }

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Unable to update password. Please try again.');
      }

      setSuccessMsg('Password updated successfully.');
      
      // Clear forms and toggles upon success
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setShowCurrent(false);
      setShowNew(false);
      setShowConfirm(false);
    } catch (err) {
      setErrorMsg(err.message || 'Unable to update password. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="settings-card-container">
      <div className="security-header">
        <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: '#111827' }}>Change Password</h3>
      </div>

      {errorMsg && (
        <div style={{ color: '#EF4444', backgroundColor: '#FEE2E2', padding: '12px', borderRadius: '6px', fontSize: '14px', fontWeight: '500', marginBottom: '24px' }}>
          {errorMsg}
        </div>
      )}
      {successMsg && (
        <div style={{ color: '#10B981', backgroundColor: '#D1FAE5', padding: '12px', borderRadius: '6px', fontSize: '14px', fontWeight: '500', marginBottom: '24px' }}>
          {successMsg}
        </div>
      )}

      <form className="settings-form" onSubmit={handleUpdatePassword} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div className="settings-form-grid cols-1" style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '500px' }}>
          
          <div className="settings-form-group" style={{ position: 'relative' }}>
            <label>CURRENT PASSWORD</label>
            <input 
              type={showCurrent ? "text" : "password"} 
              name="currentPassword" 
              value={formData.currentPassword} 
              onChange={handleChange} 
              placeholder="Enter current password"
              required 
              disabled={isSubmitting}
              style={{ width: '100%', boxSizing: 'border-box', paddingRight: '40px' }}
            />
            <button 
              type="button" 
              onClick={() => !isSubmitting && setShowCurrent(!showCurrent)}
              disabled={isSubmitting}
              style={{ position: 'absolute', right: '12px', top: '34px', background: 'transparent', border: 'none', color: '#6B7280', cursor: isSubmitting ? 'not-allowed' : 'pointer' }}
            >
              {showCurrent ? (
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" /></svg>
              ) : (
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
              )}
            </button>
          </div>

          <div className="settings-form-group" style={{ position: 'relative' }}>
            <label>NEW PASSWORD</label>
            <input 
              type={showNew ? "text" : "password"} 
              name="newPassword" 
              value={formData.newPassword} 
              onChange={handleChange} 
              placeholder="Min. 8 characters"
              required 
              disabled={isSubmitting}
              style={{ width: '100%', boxSizing: 'border-box', paddingRight: '40px' }}
            />
            <button 
              type="button" 
              onClick={() => !isSubmitting && setShowNew(!showNew)}
              disabled={isSubmitting}
              style={{ position: 'absolute', right: '12px', top: '34px', background: 'transparent', border: 'none', color: '#6B7280', cursor: isSubmitting ? 'not-allowed' : 'pointer' }}
            >
              {showNew ? (
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" /></svg>
              ) : (
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
              )}
            </button>
          </div>

          <div className="settings-form-group" style={{ position: 'relative' }}>
            <label>CONFIRM NEW PASSWORD</label>
            <input 
              type={showConfirm ? "text" : "password"} 
              name="confirmPassword" 
              value={formData.confirmPassword} 
              onChange={handleChange} 
              placeholder="Re-enter new password"
              required 
              disabled={isSubmitting}
              style={{ width: '100%', boxSizing: 'border-box', paddingRight: '40px' }}
            />
            <button 
              type="button" 
              onClick={() => !isSubmitting && setShowConfirm(!showConfirm)}
              disabled={isSubmitting}
              style={{ position: 'absolute', right: '12px', top: '34px', background: 'transparent', border: 'none', color: '#6B7280', cursor: isSubmitting ? 'not-allowed' : 'pointer' }}
            >
              {showConfirm ? (
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" /></svg>
              ) : (
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
              )}
            </button>
          </div>
        </div>

        <div className="settings-form-actions" style={{ maxWidth: '500px' }}>
          <button className="btn-save-changes" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Updating...' : 'Update Password'}
          </button>
        </div>
      </form>
    </div>
  );
}
