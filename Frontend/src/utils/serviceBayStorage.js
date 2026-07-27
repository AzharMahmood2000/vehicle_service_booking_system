import { SERVICE_BAY_STATUS } from '../constants/serviceBayStatus';

const STORAGE_KEY = 'vehiclecare_service_bays';

const initialBays = [
  { id: 'bay-1', name: 'Bay 1', status: SERVICE_BAY_STATUS.AVAILABLE, unavailablePeriods: [] },
  { id: 'bay-2', name: 'Bay 2', status: SERVICE_BAY_STATUS.AVAILABLE, unavailablePeriods: [] },
  { id: 'bay-3', name: 'Bay 3', status: SERVICE_BAY_STATUS.AVAILABLE, unavailablePeriods: [] },
  { id: 'bay-4', name: 'Bay 4', status: SERVICE_BAY_STATUS.AVAILABLE, unavailablePeriods: [] }
];

export const getServiceBays = () => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initialBays));
  return initialBays;
};

export const getBayById = (id) => {
  const bays = getServiceBays();
  return bays.find(b => b.id === id);
};

export const updateServiceBayStatus = (id, status, reason = "") => {
  const bays = getServiceBays();
  const updated = bays.map(b => {
    if (b.id === id) {
      return { ...b, status, statusReason: reason };
    }
    return b;
  });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
};

export const addBayUnavailablePeriod = (id, period) => {
  // period should contain { id, type: 'MAINTENANCE', startDate, startTime, endDate, endTime, reason }
  const bays = getServiceBays();
  const updated = bays.map(b => {
    if (b.id === id) {
      return { ...b, unavailablePeriods: [...(b.unavailablePeriods || []), period] };
    }
    return b;
  });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
};

export const removeBayUnavailablePeriod = (bayId, periodId) => {
  const bays = getServiceBays();
  const updated = bays.map(b => {
    if (b.id === bayId) {
      return { ...b, unavailablePeriods: (b.unavailablePeriods || []).filter(p => p.id !== periodId) };
    }
    return b;
  });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
};
