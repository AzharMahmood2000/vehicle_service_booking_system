/**
 * mockBookings.js
 * 
 * Mock dataset for existing workshop bookings.
 * Later replaced by GET /api/bookings
 */

export const mockBookings = [
  {
    id: "BK001",
    date: "2026-07-25",
    serviceId: "brakes",
    bayId: "bay-1",
    startTime: "09:00",
    endTime: "11:00"
  },
  {
    id: "BK002",
    date: "2026-07-25",
    serviceId: "full",
    bayId: "bay-3",
    startTime: "10:00",
    endTime: "13:00"
  },
  {
    id: "BK003",
    date: "2026-07-25",
    serviceId: "oil",
    bayId: "bay-2",
    startTime: "14:00",
    endTime: "15:00"
  }
];

export const serviceBays = [
  { id: "bay-1", name: "Bay 1" },
  { id: "bay-2", name: "Bay 2" },
  { id: "bay-3", name: "Bay 3" },
  { id: "bay-4", name: "Bay 4" }
];

export const getServiceDuration = (serviceId) => {
  const durations = {
    'oil': 60, // 1 hour
    'wash': 60, // 1 hour
    'brakes': 120, // 2 hours
    'battery': 60, // 1 hour
    'alignment': 60, // 1 hour
    'diagnostics': 60, // 1 hour
    'ac-service': 120, // 2 hours
    'basic': 120, // 2 hours
    'full': 180 // 3 hours
  };
  return durations[serviceId] || 60;
};
