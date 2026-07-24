import React, { useState } from 'react';
import { SERVICE_BAY_STATUS } from '../../constants/serviceBayStatus';
import { updateServiceBayStatus, addBayUnavailablePeriod } from '../../utils/serviceBayStorage';
import { isBookingBlockingCapacity } from '../../constants/bookingStatus';
import { updateBookingStatus, updateBookingBay } from '../../utils/bookingStorage';
import { timeToMinutes } from '../../utils/bookingAvailability';
import './BayManagerModal.css';

export default function BayManagerModal({ bays, setBays, onClose, localBookings, updateLocalBookings, showToast }) {
  const [managingBay, setManagingBay] = useState(null);
  
  // Form states
  const [statusSel, setStatusSel] = useState(SERVICE_BAY_STATUS.AVAILABLE);
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('');
  const [reason, setReason] = useState('');
  
  const [conflictBookings, setConflictBookings] = useState([]);
  
  const handleManageClick = (bay) => {
    setManagingBay(bay.id);
    setStatusSel(bay.status);
    setStartDate('');
    setStartTime('');
    setEndDate('');
    setEndTime('');
    setReason('');
    setConflictBookings([]);
  };

  const hasTimeConflict = (start1, end1, start2, end2) => {
    const s1 = timeToMinutes(start1);
    const e1 = timeToMinutes(end1);
    const s2 = timeToMinutes(start2);
    const e2 = timeToMinutes(end2);
    return s1 < e2 && e1 > s2;
  };

  const handleSave = () => {
    // If setting to available
    if (statusSel === SERVICE_BAY_STATUS.AVAILABLE) {
      const updated = updateServiceBayStatus(managingBay, SERVICE_BAY_STATUS.AVAILABLE, "");
      setBays(updated);
      showToast(`Bay restored to Available.`);
      setManagingBay(null);
      return;
    }

    if (statusSel === SERVICE_BAY_STATUS.OUT_OF_SERVICE) {
      const updated = updateServiceBayStatus(managingBay, SERVICE_BAY_STATUS.OUT_OF_SERVICE, reason);
      setBays(updated);
      showToast(`Bay set to Out of Service.`);
      setManagingBay(null);
      return;
    }

    // Maintenance logic
    if (statusSel === SERVICE_BAY_STATUS.MAINTENANCE) {
      if (!startDate || !startTime || !endDate || !endTime || !reason) {
        showToast("Please fill in all Maintenance fields.");
        return;
      }
      if (startDate > endDate || (startDate === endDate && startTime >= endTime)) {
        showToast("End time must be after start time.");
        return;
      }

      // Check conflicts
      // For simplicity in this demo form, we only check conflicts occurring on the EXACT SAME `startDate`.
      // Real app might iterate all dates between start and end.
      const affected = localBookings.filter(b => {
        if (!isBookingBlockingCapacity(b.status)) return false;
        // Either explicitly mock bay or unified serviceBay
        if (b.bayId !== managingBay && b.serviceBay !== managingBay) return false;
        
        if (b.appointmentDate === startDate) {
           return hasTimeConflict(startTime, endTime, b.startTime, b.endTime);
        }
        return false;
      });

      if (affected.length > 0) {
         setConflictBookings(affected);
         return;
      }

      confirmMaintenance();
    }
  };

  const confirmMaintenance = () => {
    const updated = updateServiceBayStatus(managingBay, SERVICE_BAY_STATUS.MAINTENANCE, reason);
    const updatedWithPeriod = addBayUnavailablePeriod(managingBay, {
        id: `maint-${Date.now()}`,
        type: 'MAINTENANCE',
        startDate,
        startTime,
        endDate,
        endTime,
        reason
    });
    setBays(updatedWithPeriod);
    showToast("Maintenance scheduled successfully.");
    setManagingBay(null);
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
            <div className="bay-list">
              {bays.map(bay => (
                <div key={bay.id} className="bay-row">
                  <div className="bay-info">
                    <h4>{bay.name}</h4>
                    <span className={`bay-status-badge ${bay.status.replace(/ /g, '-').toLowerCase()}`}>
                       <span className="dot"></span>
                       {bay.status}
                    </span>
                    {bay.status === SERVICE_BAY_STATUS.MAINTENANCE && bay.unavailablePeriods?.length > 0 && (
                       <div className="bay-subinfo">
                         Until {bay.unavailablePeriods[bay.unavailablePeriods.length - 1].endTime}
                       </div>
                    )}
                  </div>
                  <button className="btn-outline" onClick={() => handleManageClick(bay)}>Manage</button>
                </div>
              ))}
            </div>
          ) : (
            <div className="bay-edit-form">
               <button className="back-link" onClick={() => setManagingBay(null)}>&larr; Back to Bays</button>
               <h3>Manage {bays.find(b => b.id === managingBay)?.name}</h3>
               
               <div className="form-group">
                 <label>Bay Status</label>
                 <select value={statusSel} onChange={e => { setStatusSel(e.target.value); setConflictBookings([]); }}>
                   <option value={SERVICE_BAY_STATUS.AVAILABLE}>Available</option>
                   <option value={SERVICE_BAY_STATUS.MAINTENANCE}>Maintenance</option>
                   <option value={SERVICE_BAY_STATUS.OUT_OF_SERVICE}>Out of Service</option>
                 </select>
               </div>

               {statusSel === SERVICE_BAY_STATUS.OUT_OF_SERVICE && (
                 <div className="form-group">
                   <label>Reason (Optional)</label>
                   <input type="text" value={reason} onChange={e => setReason(e.target.value)} placeholder="Equipment repair required"/>
                 </div>
               )}

               {statusSel === SERVICE_BAY_STATUS.MAINTENANCE && (
                 <>
                   <div className="form-row">
                     <div className="form-group half">
                       <label>From Date</label>
                       <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
                     </div>
                     <div className="form-group half">
                       <label>Start Time</label>
                       <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} />
                     </div>
                   </div>
                   <div className="form-row">
                     <div className="form-group half">
                       <label>Until Date</label>
                       <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
                     </div>
                     <div className="form-group half">
                       <label>End Time</label>
                       <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} />
                     </div>
                   </div>
                   <div className="form-group">
                     <label>Reason</label>
                     <input type="text" value={reason} onChange={e => setReason(e.target.value)} placeholder="Hydraulic lift maintenance"/>
                   </div>
                 </>
               )}

               {conflictBookings.length > 0 && (
                 <div className="conflict-warning-box">
                    <h4>⚠️ Warning</h4>
                    <p>This bay has {conflictBookings.length} booking(s) affected by this maintenance period.</p>
                    <ul className="conflict-list">
                      {conflictBookings.map(cb => (
                        <li key={cb.id}>{cb.referenceNumber} - {cb.serviceName} ({cb.startTime})</li>
                      ))}
                    </ul>
                    <div className="conflict-actions">
                       <button className="btn-dark" onClick={() => {
                          import('../../utils/bookingAvailability').then(({ getAvailableBays }) => {
                             let reassignSuccess = true;
                             for (const b of conflictBookings) {
                               const dateBookings = localBookings.filter(lb => lb.appointmentDate === b.appointmentDate && lb.id !== b.id);
                               const possibleBays = getAvailableBays(b.startTime, b.endTime, dateBookings, b.appointmentDate);
                               const finalBays = possibleBays.filter(pb => pb.id !== managingBay);
                               
                               if (finalBays.length > 0) {
                                  updateBookingBay(b.id, finalBays[0].id);
                               } else {
                                  reassignSuccess = false;
                                  showToast(`Unable to automatically reassign booking ${b.referenceNumber}. No alternative bays available.`);
                                  return; // Stop processing
                               }
                             }
                             if (reassignSuccess) {
                                setConflictBookings([]);
                                updateLocalBookings();
                                confirmMaintenance();
                             }
                          });
                       }}>Reassign Available Bookings</button>
                       <button className="btn-outline" onClick={() => setConflictBookings([])}>Cancel Maintenance Setup</button>
                    </div>
                 </div>
               )}

               {conflictBookings.length === 0 && (
                 <div className="edit-form-actions">
                    <button className="btn-outline" onClick={() => setManagingBay(null)}>Cancel</button>
                    <button className="btn-dark" onClick={handleSave}>Save Changes</button>
                 </div>
               )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
