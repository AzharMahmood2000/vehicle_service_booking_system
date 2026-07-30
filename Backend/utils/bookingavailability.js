const Booking = require("../models/booking");
const ServiceBay = require("../models/servicebay");
const Maintenance = require("../models/maintenance");

const {
  hasTimeConflict,
} = require("./timecalculations");

const BLOCKING_STATUSES = [
  "REQUEST PENDING",
  "APPROVED",
  "IN PROGRESS",
];

const findAvailableBay = async (
  appointmentDate,
  startTime,
  endTime,
  options = {}
) => {
  const availableBays = await ServiceBay.find({
    status: "AVAILABLE",

    // Use active bays only.
    // Existing bays without an active field are also treated as active.
    active: { $ne: false },
  }, null, options).sort({
    name: 1,
  });

  if (availableBays.length === 0) {
    return null;
  }

  const bayIds = availableBays.map(
    (bay) => bay._id
  );

  const existingBookings = await Booking.find({
    appointmentDate,
    status: {
      $in: BLOCKING_STATUSES,
    },
    serviceBay: {
      $in: bayIds,
    },
  }, null, options);

  const existingMaintenances =
    await Maintenance.find({
      maintenanceDate: appointmentDate,
      active: true,
      serviceBay: {
        $in: bayIds,
      },
    }, null, options);

  for (const bay of availableBays) {
    const bayBookings = existingBookings.filter(
      (booking) =>
        booking.serviceBay.toString() ===
        bay._id.toString()
    );

    const bookingConflict = bayBookings.some(
      (booking) =>
        hasTimeConflict(
          startTime,
          endTime,
          booking.startTime,
          booking.endTime
        )
    );

    if (bookingConflict) {
      continue;
    }

    const bayMaintenances =
      existingMaintenances.filter(
        (maintenance) =>
          maintenance.serviceBay.toString() ===
          bay._id.toString()
      );

    const maintenanceConflict =
      bayMaintenances.some((maintenance) =>
        hasTimeConflict(
          startTime,
          endTime,
          maintenance.startTime,
          maintenance.endTime
        )
      );

    if (maintenanceConflict) {
      continue;
    }

    return bay;
  }

  return null;
};

module.exports = {
  BLOCKING_STATUSES,
  findAvailableBay,
};