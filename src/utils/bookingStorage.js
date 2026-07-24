import { mockBookings as demoBookings } from '../data/mockBookings';
import { normalizeBookingStatus } from '../constants/bookingStatus';

export const getBookings = () => {
  const stored = localStorage.getItem('vehiclecare_shared_bookings_v3');
  let dataToReturn = [];
  
  if (stored) {
    dataToReturn = JSON.parse(stored);
  } else {
    const starterData = [
      { 
        id: 'VSB-2026-00125', 
        referenceNumber: 'VSB-2026-00125',
        numberPlate: 'WP CAB-1234', 
        vehicleModel: 'Toyota Hilux', 
        customerName: 'Kavindu', 
        phoneNumber: '076-234576', 
        serviceName: 'Full Vehicle Service', 
        serviceId: 'full',
        estimatedDuration: 180,
        appointmentDate: '20 July 2026',
        startTime: '10:00 AM',
        endTime: '01:00 PM',
        serviceBay: 'bay-1',
        status: 'PENDING',
        createdAt: new Date().toISOString()
      }
    ];

    // Map the demo ones
    demoBookings.forEach((b, i) => {
      starterData.push({
        id: b.id,
        referenceNumber: b.id,
        numberPlate: b.customer?.plater || `WIN-000${i}`,
        vehicleModel: b.customer?.model || 'Demo Vehicle',
        customerName: b.customer?.name || 'Demo Customer',
        phoneNumber: b.customer?.phone || '077-1234567',
        serviceName: b.serviceId.toUpperCase(),
        serviceId: b.serviceId,
        estimatedDuration: (parseInt(b.endTime.split(':')[0]) - parseInt(b.startTime.split(':')[0])) * 60,
        appointmentDate: b.date,
        startTime: b.startTime,
        endTime: b.endTime,
        serviceBay: b.bayId,
        status: i === 0 ? 'APPROVED' : 'REQUEST PENDING',
        createdAt: new Date().toISOString()
      });
    });

    dataToReturn = starterData;
  }

  // Normalize before returning
  const normalizedData = dataToReturn.map(b => ({
    ...b,
    status: normalizeBookingStatus(b.status)
  }));
  
  // Implicitly heal localStorage
  if (stored) {
    localStorage.setItem('vehiclecare_shared_bookings_v3', JSON.stringify(normalizedData));
  } else {
    localStorage.setItem('vehiclecare_shared_bookings_v3', JSON.stringify(normalizedData));
  }
  
  return normalizedData;
};

export const saveBooking = (newBooking) => {
  const bookings = getBookings();
  
  // Prevent strict mode duplicates
  if (bookings.find(b => b.id === newBooking.id || b.referenceNumber === newBooking.referenceNumber)) {
    return bookings;
  }
  
  newBooking.status = normalizeBookingStatus(newBooking.status);
  
  const updated = [newBooking, ...bookings];
  localStorage.setItem('vehiclecare_shared_bookings_v3', JSON.stringify(updated));
  return updated;
};

export const updateBookingStatus = (id, newStatus) => {
  const normalizedNewStatus = normalizeBookingStatus(newStatus);
  const bookings = getBookings();
  const updated = bookings.map(b => 
    b.id === id || b.referenceNumber === id ? { ...b, status: normalizedNewStatus } : b
  );
  localStorage.setItem('vehiclecare_shared_bookings_v3', JSON.stringify(updated));
  return updated;
};

export const updateBookingBay = (id, newBay) => {
  const bookings = getBookings();
  const updated = bookings.map(b => 
    b.id === id || b.referenceNumber === id ? { ...b, serviceBay: newBay, bayId: newBay } : b
  );
  localStorage.setItem('vehiclecare_shared_bookings_v3', JSON.stringify(updated));
  return updated;
};

export const getBookingByReference = (ref) => {
  return getBookings().find(b => b.id === ref || b.referenceNumber === ref);
};

export const deleteBooking = (id) => {
  const bookings = getBookings();
  const updated = bookings.filter(b => b.id !== id && b.referenceNumber !== id);
  localStorage.setItem('vehiclecare_shared_bookings_v3', JSON.stringify(updated));
};
