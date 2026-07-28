const Booking = require("../models/booking");
const ContactRequest = require("../models/contactrequest");

const getDashboardSummary = async (req, res) => {
  try {
    const [
      totalBookings,
      pendingBookings,
      approvedBookings,
      inProgressBookings,
      completedBookings,
      totalContactRequests,
      pendingContactRequests,
      recentBookings,
    ] = await Promise.all([
      Booking.countDocuments(),

      Booking.countDocuments({
        status: "REQUEST PENDING",
      }),

      Booking.countDocuments({
        status: "APPROVED",
      }),

      Booking.countDocuments({
        status: "IN PROGRESS",
      }),

      Booking.countDocuments({
        status: "COMPLETED",
      }),

      ContactRequest.countDocuments(),

      ContactRequest.countDocuments({
        status: "PENDING",
      }),

      Booking.find()
        .populate(
          "serviceId",
          "title durationMins price"
        )
        .populate(
          "serviceBay",
          "name status"
        )
        .sort({ createdAt: -1 })
        .limit(5),
    ]);

    return res.status(200).json({
      success: true,

      bookingStats: {
        total: totalBookings,
        requestPending: pendingBookings,
        approved: approvedBookings,
        inProgress: inProgressBookings,
        completed: completedBookings,
      },

      contactStats: {
        total: totalContactRequests,
        pending: pendingContactRequests,
      },

      recentBookings,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard summary",
      error: error.message,
    });
  }
};

module.exports = {
  getDashboardSummary,
};