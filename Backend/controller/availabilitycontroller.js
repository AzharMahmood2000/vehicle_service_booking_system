const ServiceCategory = require("../models/servicecategory");

const {
  timeToMinutes,
  minutesToTime,
  calculateEndTime,
} = require("../utils/timecalculations");

const {
  findAvailableBay,
} = require("../utils/bookingavailability");

const {
  getBookingRules,
} = require("../utils/bookingsettings");

const {
  isClosedDay,
} = require("../utils/bookingday");

const getAvailableSlots = async (req, res) => {
  try {
    const { date, serviceId } = req.query;

    if (!date || !serviceId) {
      return res.status(400).json({
        success: false,
        message: "Date and serviceId are required",
      });
    }

    const datePattern = /^\d{4}-\d{2}-\d{2}$/;

    if (!datePattern.test(date)) {
      return res.status(400).json({
        success: false,
        message: "Date must use YYYY-MM-DD format",
      });
    }

    const service = await ServiceCategory.findOne({
      _id: serviceId,
      active: true,
    });

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service category not found or inactive",
      });
    }

    // Get booking rules from MongoDB
    const bookingRules = await getBookingRules();

    // Check whether the selected date is a closed day
    if (
      isClosedDay(
        date,
        bookingRules.closedDays
      )
    ) {
      return res.status(200).json({
        success: true,
        date,
        service: {
          id: service._id,
          title: service.title,
          durationMins: service.durationMins,
        },
        bookingRules: {
          openingTime: bookingRules.openingTime,
          closingTime: bookingRules.closingTime,
          slotIntervalMins: bookingRules.slotIntervalMins,
          closedDays: bookingRules.closedDays,
        },
        closed: true,
        slots: [],
      });
    }

    const openingMinutes = timeToMinutes(
      bookingRules.openingTime
    );

    const closingMinutes = timeToMinutes(
      bookingRules.closingTime
    );

    const slotIntervalMins = Number(
      bookingRules.slotIntervalMins
    );

    const slots = [];

    for (
      let currentMinutes = openingMinutes;
      currentMinutes < closingMinutes;
      currentMinutes += slotIntervalMins
    ) {
      const startTime = minutesToTime(currentMinutes);

      const endTime = calculateEndTime(
        startTime,
        service.durationMins
      );

      const endMinutes = timeToMinutes(endTime);

      if (endMinutes > closingMinutes) {
        continue;
      }

      const availableBay = await findAvailableBay(
        date,
        startTime,
        endTime
      );

      slots.push({
        startTime,
        endTime,
        available: Boolean(availableBay),
      });
    }

    return res.status(200).json({
      success: true,
      date,
      service: {
        id: service._id,
        title: service.title,
        durationMins: service.durationMins,
      },
      bookingRules: {
        openingTime: bookingRules.openingTime,
        closingTime: bookingRules.closingTime,
        slotIntervalMins,
        closedDays: bookingRules.closedDays,
      },
      closed: false,
      slots,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid service ID",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to check availability",
      error: error.message,
    });
  }
};

module.exports = {
  getAvailableSlots,
};