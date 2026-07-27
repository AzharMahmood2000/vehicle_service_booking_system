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

    // Check required fields
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

    // Validate date format
    const datePattern = /^\d{4}-\d{2}-\d{2}$/;

    if (!datePattern.test(appointmentDate)) {
      return res.status(400).json({
        success: false,
        message: "Appointment date must use YYYY-MM-DD format",
      });
    }

    // Validate time format
    const timePattern = /^([01]\d|2[0-3]):([0-5]\d)$/;

    if (!timePattern.test(startTime)) {
      return res.status(400).json({
        success: false,
        message: "Start time must use HH:MM format",
      });
    }

    const startMinutes = timeToMinutes(startTime);

    // Only allow 30-minute intervals
    if (startMinutes % 30 !== 0) {
      return res.status(400).json({
        success: false,
        message: "Booking time must use 30-minute intervals",
      });
    }

    // Find selected active service
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

    // Calculate booking end time using service duration
    const endTime = calculateEndTime(
      startTime,
      service.durationMins
    );

    const openingTime = timeToMinutes("09:00");
    const closingTime = timeToMinutes("17:00");
    const endMinutes = timeToMinutes(endTime);

    // Working hours validation
    if (
      startMinutes < openingTime ||
      startMinutes >= closingTime ||
      endMinutes > closingTime
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Booking must be within working hours from 09:00 to 17:00",
      });
    }

    // Find a free AVAILABLE service bay
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

    // Generate unique booking reference
    let referenceNumber;
    let referenceExists = true;

    while (referenceExists) {
      referenceNumber = generateBookingReference();

      referenceExists = await Booking.exists({
        referenceNumber,
      });
    }

    // Create booking
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

    // Return service and bay details
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

module.exports = {
  getBookings,
  createBooking,
  updateBookingStatus,
};