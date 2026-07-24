import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../Components/AdminSidebar/AdminSidebar';
import AdminHeader from '../../Components/AdminHeader/AdminHeader';
import { getAdminProfile, updateAdminProfile } from '../../utils/adminProfileStorage';
import './AdminProfile.css';

export default function AdminProfile() {
  const [profile, setProfile] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    const data = getAdminProfile();
    setProfile(data);
    setFormData(data);
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

  const handleSubmit = (e) => {
    e.preventDefault();
    const updated = updateAdminProfile(formData);
    setProfile(updated);
    setIsEditing(false);
    
    setToastMessage("Profile updated successfully");
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleImageChangeClick = () => {
     // In a real app, this would open a file picker.
     // For this frontend demo, we will fake a toast.
     setToastMessage("Image upload simulation triggered.");
     setTimeout(() => setToastMessage(''), 3000);
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
                <img src={profile.profileImage} alt="Profile" className="profile-avatar-huge" />
                {isEditing && (
                  <button type="button" className="edit-avatar-camera-btn" onClick={handleImageChangeClick} title="Update Photo">
                    <svg fill="currentColor" viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
                  </button>
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
