import React, { useState } from 'react';
import AdminSidebar from '../../Components/AdminSidebar/AdminSidebar';
import AdminHeader from '../../Components/AdminHeader/AdminHeader';
import AdminManageAboutUs from './AdminManageAboutUs';
import AdminSecuritySettings from './AdminSecuritySettings';
import AdminBookingRules from './AdminBookingRules';
import AdminContactLocationSettings from './AdminContactLocationSettings';
import './AdminSettings.css';

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState('Booking Rules');

  const tabs = ['Booking Rules', 'Security', 'Manage About Us', 'Contact & Location'];

  return (
    <div className="admin-settings-layout">
      <AdminSidebar />
      <div className="settings-main-content">
        <AdminHeader />
        
        <div className="settings-scroll-area">
          <div className="settings-header">
            <h1>Settings</h1>
            <p>Manage booking rules, account security, and website content.</p>
          </div>

          <div className="settings-tabs">
            {tabs.map(tab => (
              <button 
                key={tab} 
                className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          {activeTab === 'Booking Rules' && (
            <AdminBookingRules />
          )}

          {activeTab === 'Security' && (
            <AdminSecuritySettings />
          )}

          {activeTab === 'Manage About Us' && (
            <AdminManageAboutUs />
          )}
          
          {activeTab === 'Contact & Location' && (
            <AdminContactLocationSettings />
          )}

        </div>
      </div>
    </div>
  );
}
