const Booking = require("../models/booking");

const getCalendarBookings = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const datePattern = /^\d{4}-\d{2}-\d{2}$/;

    if (
      startDate &&
      !datePattern.test(startDate)
    ) {
      return res.status(400).json({
        success: false,
        message: "startDate must use YYYY-MM-DD format",
      });
    }

    if (
      endDate &&
      !datePattern.test(endDate)
    ) {
      return res.status(400).json({
        success: false,
        message: "endDate must use YYYY-MM-DD format",
      });
    }

    const filter = {};

    if (startDate && endDate) {
      filter.appointmentDate = {
        $gte: startDate,
        $lte: endDate,
      };
    } else if (startDate) {
      filter.appointmentDate = {
        $gte: startDate,
      };
    } else if (endDate) {
      filter.appointmentDate = {
        $lte: endDate,
      };
    }

    const bookings = await Booking.find(filter)
      .populate(
        "serviceId",
        "title durationMins price"
      )
      .populate(
        "serviceBay",
        "name status"
      )
      .sort({
        appointmentDate: 1,
        startTime: 1,
      });

    return res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch calendar bookings",
      error: error.message,
    });
  }
};

module.exports = {
  getCalendarBookings,
};