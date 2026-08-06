const mongoose = require("mongoose");
const Booking = require("../models/booking");
const ServiceCategory = require("../models/servicecategory");
const ServiceBay = require("../models/servicebay");

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

    // Date validation: past dates, same-day, advance booking limit
    const appointmentDateObj = new Date(`${appointmentDate}T00:00:00`);
    const todayObj = new Date();
    todayObj.setHours(0, 0, 0, 0);

    if (appointmentDateObj < todayObj) {
      return res.status(400).json({
        success: false,
        message: "Cannot book in the past",
      });
    }

    const isSameDay =
      appointmentDateObj.getTime() === todayObj.getTime();

    if (isSameDay && !bookingRules.allowSameDay) {
      return res.status(400).json({
        success: false,
        message:
          "Same-day bookings are not allowed. Please select a future date.",
      });
    }

    if (bookingRules.advanceBookingDays) {
      const diffDays = Math.round(
        (appointmentDateObj.getTime() - todayObj.getTime()) /
          (1000 * 60 * 60 * 24)
      );

      if (diffDays > bookingRules.advanceBookingDays) {
        return res.status(400).json({
          success: false,
          message: `You can only book up to ${bookingRules.advanceBookingDays} days in advance`,
        });
      }
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

    const normalizedVehicleNumber = vehicleNumber.trim().toUpperCase();

    const existingBooking = await Booking.findOne({
      vehicleNumber: normalizedVehicleNumber,
      appointmentDate,
      startTime,
      status: { $in: ["REQUEST PENDING", "APPROVED", "IN PROGRESS"] }
    });

    if (existingBooking) {
      return res.status(409).json({
        success: false,
        message: "A booking already exists for this vehicle at the selected date and time."
      });
    }

    let booking;
    const session = await mongoose.startSession();

    try {
      await session.withTransaction(async () => {
        const availableBay = await findAvailableBay(
          appointmentDate,
          startTime,
          endTime,
          { session }
        );

        if (!availableBay) {
          const error = new Error("NO_BAY_AVAILABLE");
          error.status = 409;
          throw error;
        }

        // Atomically lock the bay inside the transaction using bookingLockVersion
        await ServiceBay.findByIdAndUpdate(
          availableBay._id,
          { $inc: { bookingLockVersion: 1 } },
          { session, new: true }
        );

        let referenceNumber;
        let referenceExists = true;

        while (referenceExists) {
          referenceNumber = generateBookingReference();

          referenceExists = await Booking.findOne(
            { referenceNumber },
            { _id: 1 },
            { session }
          );
        }

        const newBookings = await Booking.create(
          [
            {
              referenceNumber,
              customerName,
              phoneNumber,
              vehicleNumber: normalizedVehicleNumber,
              vehicleModel,
              serviceId: service._id,
              serviceName: service.title,
              estimatedDuration: service.durationMins,
              appointmentDate,
              startTime,
              endTime,
              serviceBay: availableBay._id,
              status: "REQUEST PENDING",
            },
          ],
          { session }
        );

        booking = newBookings[0];
      });
    } catch (error) {
      if (error.message === "NO_BAY_AVAILABLE" || error.status === 409) {
        return res.status(409).json({
          success: false,
          message:
            "Cannot accept booking due to many vehicles. No service bay is available for this time.",
        });
      }
      throw error;
    } finally {
      await session.endSession();
    }

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
    const { phone } = req.query;

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: "Phone number is required for tracking",
      });
    }

    const bookings = await Booking.find({
      referenceNumber: identifier,
      phoneNumber: phone
    })
      .populate("serviceId", "title durationMins price")
      .populate("serviceBay", "name status")
      .sort({ createdAt: -1 });

    if (bookings.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No booking found with this reference and phone number",
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

const markBookingNotificationRead = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { adminNotificationRead: true },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Notification marked as read",
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
      message: "Failed to mark notification as read",
      error: error.message,
    });
  }
};

const deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found."
      });
    }

    if (booking.status !== "REJECTED") {
      return res.status(400).json({
        success: false,
        message: "Only rejected bookings can be deleted."
      });
    }

    await Booking.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Rejected booking deleted successfully."
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
      message: "Failed to delete booking",
      error: error.message,
    });
  }
};

module.exports = {
  getBookings,
  createBooking,
  updateBookingStatus,
  trackBooking,
  markBookingNotificationRead,
  deleteBooking,
};