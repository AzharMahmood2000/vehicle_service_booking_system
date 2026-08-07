import React, { useState, useEffect, useRef } from 'react';
import AdminSidebar from '../../Components/AdminSidebar/AdminSidebar';
import AdminHeader from '../../Components/AdminHeader/AdminHeader';
import API_BASE_URL from '../../api';
import { resolveImagePath } from '../../utils/imageResolver';
import './AdminProfile.css';

export default function AdminProfile() {
  const [profile, setProfile] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [toastMessage, setToastMessage] = useState('');
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchProfile = async () => {
      let currentData = {
        fullName: 'Admin',
        email: 'admin@vehiclecare.com',
        phone: '',
        profileImage: '',
        role: 'SYSTEM ADMIN',
        accessLevel: 'Full Access',
        primaryAdmin: true
      };

      const adminStr = localStorage.getItem('vehiclecare_admin') || sessionStorage.getItem('vehiclecare_admin');
      if (adminStr) {
        try {
          const storedAdmin = JSON.parse(adminStr);
          currentData.fullName = storedAdmin.name || currentData.fullName;
          currentData.email = storedAdmin.email || currentData.email;
          currentData.profileImage = storedAdmin.profileImage || '';
        } catch {}
      }

      try {
        const token = localStorage.getItem('vehiclecare_admin_token') || sessionStorage.getItem('vehiclecare_admin_token');
        if (token) {
           const res = await fetch(`${API_BASE_URL}/auth/me`, {
             headers: { 'Authorization': `Bearer ${token}` }
           });
           const data = await res.json();
           if (data.success && data.admin) {
              currentData.fullName = data.admin.name || currentData.fullName;
              currentData.email = data.admin.email || currentData.email;
              currentData.profileImage = data.admin.profileImage || currentData.profileImage;
           }
        }
      } catch {}
      
      setProfile(currentData);
      setFormData(currentData);
    };
    fetchProfile();
  }, []);

  const handleEditClick = () => {
    setFormData(profile);
    setIsEditing(true);
  };

  const handleCancelClick = () => {
    setIsEditing(false);
    setFormData(profile);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsEditing(false);
    setProfile({ ...profile, ...formData });
    setToastMessage("Profile updated successfully (local simulation)");
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleImageChangeClick = () => {
     if (fileInputRef.current) {
        fileInputRef.current.click();
     }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setUploadError("File exceeds 5MB limit");
      setTimeout(() => setUploadError(''), 3000);
      return;
    }
    
    setUploadError('');
    setUploadLoading(true);

    try {
      const token = localStorage.getItem('vehiclecare_admin_token') || sessionStorage.getItem('vehiclecare_admin_token');
      const formDataUpload = new FormData();
      formDataUpload.append('image', file);

      const res = await fetch(`${API_BASE_URL}/auth/profile-image`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formDataUpload
      });
      const data = await res.json();

      if (res.ok && data.success) {
        const updated = { ...profile, profileImage: data.profileImage };
        // Update local storage object so it works across refreshes
        const adminStr = localStorage.getItem('vehiclecare_admin');
        if (adminStr) {
          try {
             let parsed = JSON.parse(adminStr);
             parsed.profileImage = data.profileImage;
             localStorage.setItem('vehiclecare_admin', JSON.stringify(parsed));
          } catch {}
        }
        setProfile(updated);
        setFormData(updated);
        setToastMessage("Profile image updated successfully");
        setTimeout(() => setToastMessage(''), 3000);
      } else {
        setUploadError(data.message || "Failed to upload image");
        setTimeout(() => setUploadError(''), 3000);
      }
    } catch {
      setUploadError("Network error. Please try again.");
      setTimeout(() => setUploadError(''), 3000);
    } finally {
      setUploadLoading(false);
      e.target.value = '';
    }
  };

  return (
    <div className="admin-profile-layout">
      <AdminSidebar />
      <div className="profile-main-content">
        <AdminHeader />
        
        <div className="profile-scroll-area">
          <div className="profile-header-meta">
            <h1>Admin Profile</h1>
            <p>Manage your personal information and system access identity.</p>
          </div>

          <div className="profile-card-container">
            <div className={`profile-top-section ${isEditing ? 'editing-mode' : ''}`}>
              <div className="profile-avatar-wrapper">
                <img src={resolveImagePath(profile.profileImage || '/assets/images/profile vector.png')} alt="Profile" className="profile-avatar-huge" />
                {uploadLoading && (
                   <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                     <span style={{ fontSize: '12px', fontWeight: 'bold' }}>Uploading...</span>
                   </div>
                )}
                {isEditing && (
                  <>
                    <input type="file" ref={fileInputRef} accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }} onChange={handleFileChange} />
                    <button type="button" className="edit-avatar-camera-btn" onClick={handleImageChangeClick} disabled={uploadLoading} title="Update Photo">
                      <svg fill="currentColor" viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
                    </button>
                    {uploadError && <div style={{ position: 'absolute', bottom: -20, left: '50%', transform: 'translateX(-50%)', color: '#EF4444', fontSize: '10px', whiteSpace: 'nowrap' }}>{uploadError}</div>}
                  </>
                )}
              </div>
              <div className="profile-title-block">
                <h2>{profile.fullName}</h2>
                <div className="role-subline">
                  <span className="bold-role">{profile.role}</span>
                </div>
                <div className="access-tags">
                  {profile.primaryAdmin && <span className="admin-badge primary">Primary Admin</span>}
                  <span className="admin-badge access">{profile.accessLevel}</span>
                </div>
              </div>
              
              {!isEditing && (
                <div className="profile-edit-trigger">
                  <button className="btn-dark-outline" onClick={handleEditClick}>
                    <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                    Edit Profile
                  </button>
                </div>
              )}
            </div>

            <div className="profile-details-section">
              <h3 className="section-label">Personal Information</h3>
              
              {!isEditing ? (
                 <div className="read-only-grid">
                   <div className="read-group">
                     <span className="read-label">Full Name</span>
                     <span className="read-value">{profile.fullName}</span>
                   </div>
                   <div className="read-group">
                     <span className="read-label">Email Address</span>
                     <span className="read-value">{profile.email}</span>
                   </div>
                   <div className="read-group">
                     <span className="read-label">Phone Number</span>
                     <span className="read-value">{profile.phone}</span>
                   </div>
                 </div>
              ) : (
                <form className="profile-edit-form" onSubmit={handleSubmit}>
                  <div className="profile-form-grid">
                    <div className="form-group">
                      <label>FULL NAME</label>
                      <input type="text" name="fullName" value={formData.fullName || ''} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                      <label>EMAIL ADDRESS</label>
                      <input type="email" name="email" value={formData.email || ''} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                      <label>PHONE NUMBER</label>
                      <input type="text" name="phone" value={formData.phone || ''} onChange={handleChange} required />
                    </div>
                  </div>
                  
                  <div className="profile-form-actions">
                    <button type="button" className="btn-cancel" onClick={handleCancelClick}>Cancel</button>
                    <button type="submit" className="btn-save">Save Changes</button>
                  </div>
                </form>
              )}
            </div>

            <div className="profile-details-section account-info-section">
               <h3 className="section-label">System Account Setup (Read-Only)</h3>
               <div className="read-only-grid">
                 <div className="read-group">
                   <span className="read-label">Administrator Role</span>
                   <span className="read-value">{profile.role}</span>
                 </div>
                 <div className="read-group">
                   <span className="read-label">Access Level</span>
                   <span className="read-value">{profile.accessLevel}</span>
                 </div>
               </div>
               <p className="system-note">To change fundamental system access logic or roles, please contact the primary infrastructure team administrator.</p>
            </div>
            
          </div>
        </div>

        {/* Success Toast */}
        {toastMessage && (
          <div className="admin-profile-toast show">
            <div className="toast-icon">
              <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg>
            </div>
            <div className="toast-content">
              <h4>Update Successful</h4>
              <p>{toastMessage}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
