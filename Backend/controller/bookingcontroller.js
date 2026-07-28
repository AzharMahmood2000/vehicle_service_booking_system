const Booking = require("../models/booking");
const ServiceCategory = require("../models/servicecategory");

const {
  calculateEndTime,
  timeToMinutes,
} = require("../utils/timecalculations");

const {
  findAvailableBay,
} = require("../utils/bookingavailability");

const {
  generateBookingReference,
} = require("../utils/bookingreference");

const {
  getBookingRules,
} = require("../utils/bookingsettings");

const {
  isClosedDay,
} = require("../utils/bookingday");

const getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("serviceId", "title durationMins price")
      .populate("serviceBay", "name status")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch bookings",
      error: error.message,
    });
  }
};

const createBooking = async (req, res) => {
  try {
    const {
      customerName,
      phoneNumber,
      vehicleNumber,
      vehicleModel,
      serviceId,
      appointmentDate,
      startTime,
    } = req.body;

    if (
      !customerName ||
      !phoneNumber ||
      !vehicleNumber ||
      !vehicleModel ||
      !serviceId ||
      !appointmentDate ||
      !startTime
    ) {
      return res.status(400).json({
        success: false,
        message: "All booking fields are required",
      });
    }

    const datePattern = /^\d{4}-\d{2}-\d{2}$/;

    if (!datePattern.test(appointmentDate)) {
      return res.status(400).json({
        success: false,
        message: "Appointment date must use YYYY-MM-DD format",
      });
    }

    const timePattern = /^([01]\d|2[0-3]):([0-5]\d)$/;

    if (!timePattern.test(startTime)) {
      return res.status(400).json({
        success: false,
        message: "Start time must use HH:MM format",
      });
    }

    // Get booking rules from MongoDB settings
    const bookingRules = await getBookingRules();

    // Check whether the selected day is closed
    if (
      isClosedDay(
        appointmentDate,
        bookingRules.closedDays
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Bookings are not available on this closed day",
      });
    }

    const startMinutes = timeToMinutes(startTime);
    const openingTime = timeToMinutes(bookingRules.openingTime);
    const closingTime = timeToMinutes(bookingRules.closingTime);

    // Validate booking interval based on configured opening time
    if (
      startMinutes < openingTime ||
      (startMinutes - openingTime) % bookingRules.slotIntervalMins !== 0
    ) {
      return res.status(400).json({
        success: false,
        message: `Booking time must use ${bookingRules.slotIntervalMins}-minute intervals`,
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

    const endTime = calculateEndTime(
      startTime,
      service.durationMins
    );

    const endMinutes = timeToMinutes(endTime);

    // Validate dynamic working hours
    if (
      startMinutes < openingTime ||
      startMinutes >= closingTime ||
      endMinutes > closingTime
    ) {
      return res.status(400).json({
        success: false,
        message: `Booking must be within working hours from ${bookingRules.openingTime} to ${bookingRules.closingTime}`,
      });
    }

    const availableBay = await findAvailableBay(
      appointmentDate,
      startTime,
      endTime
    );

    if (!availableBay) {
      return res.status(409).json({
        success: false,
        message:
          "Cannot accept booking due to many vehicles. No service bay is available for this time.",
      });
    }

    let referenceNumber;
    let referenceExists = true;

    while (referenceExists) {
      referenceNumber = generateBookingReference();

      referenceExists = await Booking.exists({
        referenceNumber,
      });
    }

    const booking = await Booking.create({
      referenceNumber,
      customerName,
      phoneNumber,
      vehicleNumber,
      vehicleModel,
      serviceId: service._id,
      serviceName: service.title,
      estimatedDuration: service.durationMins,
      appointmentDate,
      startTime,
      endTime,
      serviceBay: availableBay._id,
      status: "REQUEST PENDING",
    });

    await booking.populate(
      "serviceId",
      "title durationMins price"
    );

    await booking.populate(
      "serviceBay",
      "name status"
    );

    return res.status(201).json({
      success: true,
      message: "Booking created successfully",
      booking,
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
      message: "Failed to create booking",
      error: error.message,
    });
  }
};

const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const validStatuses = [
      "REQUEST PENDING",
      "APPROVED",
      "IN PROGRESS",
      "COMPLETED",
      "REJECTED",
      "CANCELLED",
    ];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking status",
      });
    }

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status },
      {
        new: true,
        runValidators: true,
      }
    )
      .populate("serviceId", "title durationMins price")
      .populate("serviceBay", "name status");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Booking status updated successfully",
      booking,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to update booking status",
      error: error.message,
    });
  }
};

const trackBooking = async (req, res) => {
  try {
    const { identifier } = req.params;

    const bookings = await Booking.find({
      $or: [
        { referenceNumber: identifier },
        { phoneNumber: identifier },
      ],
    })
      .populate("serviceId", "title durationMins price")
      .populate("serviceBay", "name status")
      .sort({ createdAt: -1 });

    if (bookings.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No booking found",
      });
    }

    return res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to track booking",
      error: error.message,
    });
  }
};

module.exports = {
  getBookings,
  createBooking,
  updateBookingStatus,
  trackBooking,
};