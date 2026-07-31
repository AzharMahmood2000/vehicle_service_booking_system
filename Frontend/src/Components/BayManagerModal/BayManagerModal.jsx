import React, { useState } from 'react';
import API_BASE_URL from '../../api';
import './BayManagerModal.css';

export default function BayManagerModal({ bays, onClose, showToast, refetchBays }) {
  const [managingBay, setManagingBay] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Add Bay states
  const [isAddingBay, setIsAddingBay] = useState(false);
  const [newBayName, setNewBayName] = useState('');

  // Form states for Manage
  const [bayName, setBayName] = useState('');
  const [statusSel, setStatusSel] = useState('AVAILABLE');
  const [maintenanceDate, setMaintenanceDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [reason, setReason] = useState('');
  
  const getHeaders = () => {
    const token = sessionStorage.getItem('vehiclecare_admin_token') || localStorage.getItem('vehiclecare_admin_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  const handleManageClick = (bay) => {
    setManagingBay(bay);
    setBayName(bay.name);
    setStatusSel(bay.status === 'OUT OF SERVICE' ? 'OUT_OF_SERVICE' : bay.status);
    setMaintenanceDate('');
    setStartTime('');
    setEndTime('');
    setReason('');
  };

  const handleAddBay = async () => {
    if (!newBayName.trim()) {
      showToast('Bay name is required.');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/bays`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ name: newBayName.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to add service bay.');
      
      showToast('Service bay added successfully.');
      setNewBayName('');
      setIsAddingBay(false);
      refetchBays();
    } catch(err) {
      showToast(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRenameBay = async () => {
    if (!bayName.trim() || bayName.trim() === managingBay.name) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/bays/${managingBay._id}/name`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ name: bayName.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to rename bay.');
      showToast('Bay renamed successfully.');
      refetchBays();
      setManagingBay(data.bay);
    } catch(err) {
       showToast(err.message);
    } finally {
       setIsSubmitting(false);
    }
  };

  const handleSaveStatus = async () => {
    setIsSubmitting(true);
    try {
      if (statusSel === 'AVAILABLE' || statusSel === 'OUT_OF_SERVICE') {
        const res = await fetch(`${API_BASE_URL}/bays/${managingBay._id}/status`, {
          method: 'PUT',
          headers: getHeaders(),
          body: JSON.stringify({ status: statusSel })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to update bay status.');
        showToast(`Status updated to ${statusSel.replace('_', ' ')}.`);
        refetchBays();
        setManagingBay(data.bay);
      } else if (statusSel === 'MAINTENANCE') {
        if (!maintenanceDate || !startTime || !endTime) {
           showToast("Please fill in Date, Start Time, and End Time.");
           setIsSubmitting(false);
           return;
        }
        
        if (managingBay.status !== 'MAINTENANCE') {
           await fetch(`${API_BASE_URL}/bays/${managingBay._id}/status`, {
             method: 'PUT',
             headers: getHeaders(),
             body: JSON.stringify({ status: 'MAINTENANCE' })
           });
        }
        
        const res = await fetch(`${API_BASE_URL}/maintenance`, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify({
            serviceBay: managingBay._id,
            maintenanceDate,
            startTime,
            endTime,
            reason
          })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to schedule maintenance.");
        showToast("Maintenance scheduled successfully.");
        refetchBays();
        setManagingBay(null);
      }
    } catch(err) {
      showToast(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeactivate = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/bays/${managingBay._id}/deactivate`, {
        method: 'PUT',
        headers: getHeaders()
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to deactivate bay.');
      showToast('Bay deactivated successfully.');
      refetchBays();
      setManagingBay(data.bay);
    } catch(err) {
      showToast(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReactivate = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/bays/${managingBay._id}/reactivate`, {
        method: 'PUT',
        headers: getHeaders()
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to reactivate bay.');
      showToast('Bay reactivated successfully.');
      refetchBays();
      setManagingBay(data.bay);
      setStatusSel(data.bay.status === 'OUT OF SERVICE' ? 'OUT_OF_SERVICE' : data.bay.status);
    } catch(err) {
      showToast(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bay-manager-overlay" onClick={onClose}>
      <div className="bay-manager-modal" onClick={e => e.stopPropagation()}>
        <div className="manager-header">
          <h2>SERVICE BAY MANAGEMENT</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        <div className="manager-body">
          {!managingBay ? (
            <div className="bay-list-container">
              <div className="bay-list-header">
                {!isAddingBay ? (
                   <button className="btn-dark" onClick={() => setIsAddingBay(true)}>+ Add Service Bay</button>
                ) : (
                   <div className="add-bay-form">
                     <div className="form-group">
                       <label>Bay Name</label>
                       <input 
                         type="text" 
                         value={newBayName} 
                         onChange={e => setNewBayName(e.target.value)} 
                         placeholder="e.g. Express Bay"
                       />
                     </div>
                     <div className="edit-form-actions">
                       <button className="btn-outline" onClick={() => { setIsAddingBay(false); setNewBayName(''); }} disabled={isSubmitting}>Cancel</button>
                       <button className="btn-dark" onClick={handleAddBay} disabled={isSubmitting}>Add Bay</button>
                     </div>
                   </div>
                )}
              </div>

              <div className="bay-list">
                {bays.length === 0 && <div style={{padding: '20px', color: '#6A5C7A'}}>No bays available.</div>}
                {bays.map(bay => (
                  <div key={bay._id} className={`bay-row ${!bay.active ? 'deactivated' : ''}`}>
                    <div className="bay-info">
                      <h4>{bay.name}</h4>
                      {!bay.active ? (
                        <span className="bay-status-badge deactivated">
                          <span className="dot"></span> DEACTIVATED
                        </span>
                      ) : (
                        <span className={`bay-status-badge ${bay.status.replace(/ /g, '-').toLowerCase()}`}>
                          <span className="dot"></span> {bay.status}
                        </span>
                      )}
                    </div>
                    <button className="btn-outline" onClick={() => handleManageClick(bay)}>Manage</button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bay-edit-form">
               <button className="back-link" onClick={() => setManagingBay(null)} disabled={isSubmitting}>&larr; Back to Bays</button>
               
               <div className="form-group rename-group">
                 <label>BAY NAME</label>
                 <div className="rename-row">
                   <input 
                     type="text" 
                     value={bayName} 
                     onChange={e => setBayName(e.target.value)} 
                   />
                   <button 
                     className="btn-dark" 
                     onClick={handleRenameBay}
                     disabled={isSubmitting || bayName.trim() === managingBay.name || !bayName.trim()}
                   >
                     Rename
                   </button>
                 </div>
               </div>
               
               {!managingBay.active ? (
                 <div className="reactivate-section">
                   <div className="deactivated-notice">
                     <h4>DEACTIVATED</h4>
                     <p>This bay is currently excluded from booking capacity.</p>
                   </div>
                   <button className="btn-dark" onClick={handleReactivate} disabled={isSubmitting}>Reactivate Bay</button>
                 </div>
               ) : (
                 <>
                   <div className="form-group">
                     <label>BAY STATUS</label>
                     <select value={statusSel} onChange={e => setStatusSel(e.target.value)} disabled={isSubmitting}>
                       <option value="AVAILABLE">Available</option>
                       <option value="MAINTENANCE">Maintenance</option>
                       <option value="OUT_OF_SERVICE">Out of Service</option>
                     </select>
                   </div>

                   {statusSel === 'AVAILABLE' && (
                     <p className="status-helper">This bay is available for booking allocation.</p>
                   )}

                   {statusSel === 'OUT_OF_SERVICE' && (
                     <div className="status-helper">
                       <p>This bay will remain in the system but will not be available for new booking allocation until its status is changed back to Available.</p>
                     </div>
                   )}

                   {statusSel === 'MAINTENANCE' && (
                     <div className="maintenance-fields">
                       <div className="form-row">
                         <div className="form-group half">
                           <label>Maintenance Date</label>
                           <input type="date" value={maintenanceDate} onChange={e => setMaintenanceDate(e.target.value)} disabled={isSubmitting} />
                         </div>
                       </div>
                       <div className="form-row">
                         <div className="form-group half">
                           <label>Start Time</label>
                           <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} disabled={isSubmitting} />
                         </div>
                         <div className="form-group half">
                           <label>End Time</label>
                           <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} disabled={isSubmitting} />
                         </div>
                       </div>
                       <div className="form-group">
                         <label>Reason</label>
                         <input type="text" value={reason} onChange={e => setReason(e.target.value)} placeholder="e.g. Hydraulic lift maintenance" disabled={isSubmitting} />
                       </div>
                     </div>
                   )}

                   <div className="edit-form-actions top-actions">
                      <button className="btn-outline" onClick={() => setManagingBay(null)} disabled={isSubmitting}>Cancel</button>
                      <button className="btn-dark" onClick={handleSaveStatus} disabled={isSubmitting}>Save Status</button>
                   </div>
                   
                   <hr className="divider" />

                   <div className="deactivate-section">
                     <h4>Deactivate Service Bay</h4>
                     <p>Deactivating this bay removes it from workshop booking capacity without deleting its history.</p>
                     <button className="btn-danger" onClick={handleDeactivate} disabled={isSubmitting}>Deactivate Bay</button>
                   </div>
                 </>
               )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
