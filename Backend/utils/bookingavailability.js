const Booking = require("../models/booking");
const ServiceBay = require("../models/servicebay");

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
  endTime
) => {
  const availableBays = await ServiceBay.find({
    status: "AVAILABLE",
  }).sort({
    name: 1,
  });

  if (availableBays.length === 0) {
    return null;
  }

  const existingBookings = await Booking.find({
    appointmentDate,
    status: {
      $in: BLOCKING_STATUSES,
    },
    serviceBay: {
      $in: availableBays.map((bay) => bay._id),
    },
  });

  for (const bay of availableBays) {
    const bayBookings = existingBookings.filter(
      (booking) =>
        booking.serviceBay.toString() === bay._id.toString()
    );

    const hasConflict = bayBookings.some((booking) =>
      hasTimeConflict(
        startTime,
        endTime,
        booking.startTime,
        booking.endTime
      )
    );

    if (!hasConflict) {
      return bay;
    }
  }

  return null;
};

module.exports = {
  BLOCKING_STATUSES,
  findAvailableBay,
};