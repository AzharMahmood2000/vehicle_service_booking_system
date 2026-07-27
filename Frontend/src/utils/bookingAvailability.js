/**
 * bookingAvailability.js
 * 
 * Utility functions for computing booking availability based on
 * service durations, overlapping times, and 4 service bays.
 */

import { isBookingBlockingCapacity } from '../constants/bookingStatus';
import { getServiceBays } from './serviceBayStorage';
import { SERVICE_BAY_STATUS } from '../constants/serviceBayStatus';

const WORK_START = "09:00";
const WORK_END = "17:00"; // 05:00 PM

/**
 * Parses time string "HH:MM" to minutes from midnight
 */
export const timeToMinutes = (timeStr) => {
  const [hours, mins] = timeStr.split(':').map(Number);
  return hours * 60 + mins;
};

/**
 * Formats minutes from midnight to "HH:MM"
 */
export const minutesToTime = (mins) => {
  const hours = Math.floor(mins / 60);
  const minutes = mins % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

/**
 * Calculates end time based on start time and duration in minutes
 */
export const calculateEndTimeStr = (startTimeStr, durationMinutes) => {
  const startMins = timeToMinutes(startTimeStr);
  const endMins = startMins + durationMinutes;
  return minutesToTime(endMins);
};

/**
 * Generates regular 30-min intervals between limits
 */
export const generateStartTimes = () => {
  const startMins = timeToMinutes(WORK_START);
  const endMins = timeToMinutes(WORK_END);
  const times = [];
  for (let m = startMins; m < endMins; m += 30) {
    times.push(minutesToTime(m));
  }
  return times;
};

/**
 * Checks if two time intervals overlap (Intervals: [start, end))
 */
export const hasTimeConflict = (start1, end1, start2, end2) => {
  const s1 = timeToMinutes(start1);
  const e1 = timeToMinutes(end1);
  const s2 = timeToMinutes(start2);
  const e2 = timeToMinutes(end2);
  
  // Overlap condition: newStart < existingEnd AND newEnd > existingStart
  return s1 < e2 && e1 > s2;
};

/**
 * Determines which bays are available for a given time window
 */
export const getAvailableBays = (targetStartTime, targetEndTime, dateBookings, targetDateStr = null) => {
  const availableBays = [];
  const bays = getServiceBays();
  
  for (const bay of bays) {
    if (bay.status === SERVICE_BAY_STATUS.OUT_OF_SERVICE) {
      continue;
    }

    if (bay.status === SERVICE_BAY_STATUS.MAINTENANCE && targetDateStr) {
      let isUnderMaintenance = false;
      for (const period of (bay.unavailablePeriods || [])) {
        if (period.startDate === targetDateStr) {
          if (hasTimeConflict(targetStartTime, targetEndTime, period.startTime, period.endTime)) {
            isUnderMaintenance = true;
            break;
          }
        }
      }
      if (isUnderMaintenance) continue;
    }

    // Check if this bay has any conflicting booking
    const hasConflict = dateBookings.some(booking => {
      // Must map to either 'bayId' (mock) or 'serviceBay' (unified)
      if (booking.bayId !== bay.id && booking.serviceBay !== bay.id) return false;
      
      // Must check if booking is blocking capacity
      if (booking.status && !isBookingBlockingCapacity(booking.status)) return false;

      return hasTimeConflict(targetStartTime, targetEndTime, booking.startTime, booking.endTime);
    });
    
    if (!hasConflict) {
      availableBays.push(bay);
    }
  }
  
  return availableBays;
};

/**
 * Returns a list of valid start times and their capacity
 */
export const getAvailableStartTimes = (selectedDate, durationMinutes, allBookings) => {
  const possibleStartTimes = generateStartTimes();
  const dateBookings = allBookings.filter(b => b.date === selectedDate);
  const validTimes = [];
  
  const workEndMins = timeToMinutes(WORK_END);

  for (const startTime of possibleStartTimes) {
    const endTime = calculateEndTimeStr(startTime, durationMinutes);
    
    // Check if service finishes after working hours
    if (timeToMinutes(endTime) > workEndMins) {
      continue;
    }
    
    const availableBays = getAvailableBays(startTime, endTime, dateBookings, selectedDate);
    
    if (availableBays.length > 0) {
      validTimes.push({
        startTime,
        endTime,
        availableBaysCount: availableBays.length,
        bays: availableBays
      });
    }
  }
  
  return validTimes;
};

/**
 * Automatically assigns the first available bay
 */
export const assignAvailableBay = (startTime, endTime, dateBookings, selectedDate) => {
  const availableBays = getAvailableBays(startTime, endTime, dateBookings, selectedDate);
  if (availableBays.length > 0) {
    return availableBays[0].id;
  }
  return null;
};

/**
 * Format "13:00" to "01:00 PM"
 */
export const formatTime12h = (timeStr) => {
  const [hours, mins] = timeStr.split(':').map(Number);
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const h12 = hours % 12 || 12;
  return `${String(h12).padStart(2, '0')}:${String(mins).padStart(2, '0')} ${ampm}`;
};

/**
 * High-level helper for the homepage widget to mock "Today's Availability"
 */
export const getTodayWorkshopAvailability = () => {
  const bays = getServiceBays();
  // Filter out any bays that are currently entirely down or active under maintenance checking today's date
  const todayStr = new Date().toISOString().split('T')[0];
  
  const operationalBays = bays.filter(b => {
     if (b.status === SERVICE_BAY_STATUS.OUT_OF_SERVICE) return false;
     if (b.status === SERVICE_BAY_STATUS.MAINTENANCE) {
        // Technically check if there's a maintenance block overlapping today's working hours
        // For simplicity on the homepage widget, we can tentatively assume maintenance lowers available block count heavily
        let coversToday = (b.unavailablePeriods || []).some(p => p.startDate === todayStr);
        if (coversToday) return false;
     }
     return true;
  });

  return {
    totalBays: bays.length,
    baysAvailableNow: operationalBays.length > 0 ? Math.max(0, operationalBays.length - 1) : 0,
    acceptingBookings: operationalBays.length > 0
  };
};
