/**
 * Mock Booking Availability Data
 * --------------------------------
 * This file contains mock availability data for the booking system.
 * When the backend (Node.js + Express + MongoDB) is ready,
 * replace the functions below with actual API calls.
 */

const TOTAL_SLOTS_PER_DAY = 12;

/**
 * Helper: format a Date object as YYYY-MM-DD
 */
const formatDate = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

/**
 * Generate mock data for the next 14 days.
 * Each entry has: date, totalSlots, bookedSlots, remainingSlots
 */
const generateMockAvailability = () => {
  const data = {};
  const today = new Date();

  // Predefined booked counts for variety
  const bookedPattern = [8, 5, 12, 3, 10, 7, 11, 2, 9, 6, 12, 4, 8, 1];

  for (let i = 0; i < 14; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const dateStr = formatDate(date);
    const booked = bookedPattern[i % bookedPattern.length];
    const clampedBooked = Math.min(booked, TOTAL_SLOTS_PER_DAY);

    data[dateStr] = {
      date: dateStr,
      totalSlots: TOTAL_SLOTS_PER_DAY,
      bookedSlots: clampedBooked,
      remainingSlots: TOTAL_SLOTS_PER_DAY - clampedBooked,
    };
  }

  return data;
};

// Cache the generated data
const mockAvailabilityData = generateMockAvailability();

/**
 * Get availability for today.
 * Replace with: fetch('/api/availability/today')
 */
export const getTodayAvailability = () => {
  const todayStr = formatDate(new Date());
  return mockAvailabilityData[todayStr] || {
    date: todayStr,
    totalSlots: TOTAL_SLOTS_PER_DAY,
    bookedSlots: 0,
    remainingSlots: TOTAL_SLOTS_PER_DAY,
  };
};

/**
 * Get availability for a specific date string (YYYY-MM-DD).
 * Replace with: fetch(`/api/availability/${dateStr}`)
 */
export const getAvailabilityByDate = (dateStr) => {
  return mockAvailabilityData[dateStr] || {
    date: dateStr,
    totalSlots: TOTAL_SLOTS_PER_DAY,
    bookedSlots: 0,
    remainingSlots: TOTAL_SLOTS_PER_DAY,
  };
};

/**
 * Find the next available date starting from a given date.
 * Replace with: fetch(`/api/availability/next-available?from=${dateStr}`)
 */
export const getNextAvailableDate = (fromDateStr) => {
  const from = new Date(fromDateStr);
  for (let i = 1; i <= 30; i++) {
    const next = new Date(from);
    next.setDate(from.getDate() + i);
    const nextStr = formatDate(next);
    const data = mockAvailabilityData[nextStr];
    if (!data || data.remainingSlots > 0) {
      return nextStr;
    }
  }
  return null;
};

/**
 * Derive availability status from remaining slots.
 */
export const getAvailabilityStatus = (remainingSlots) => {
  if (remainingSlots <= 0) return 'fully-booked';
  if (remainingSlots <= 3) return 'almost-full';
  return 'available';
};

/**
 * Get the display label for a status.
 */
export const getStatusLabel = (status) => {
  switch (status) {
    case 'fully-booked': return 'Fully Booked';
    case 'almost-full': return 'Almost Full';
    case 'available': return 'Available';
    default: return 'Unknown';
  }
};

/**
 * Format a YYYY-MM-DD string to a readable date like "July 25, 2026"
 */
export const formatDisplayDate = (dateStr) => {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export { TOTAL_SLOTS_PER_DAY };
