const express = require("express");

const {
  getBookings,
  createBooking,
  updateBookingStatus,
  trackBooking,
} = require("../controller/bookingcontroller");

const {
  protect,
} = require("../middleware/authmiddleware");

const router = express.Router();

// Public routes
router.post("/", createBooking);

router.get("/track/:identifier", trackBooking);

// Admin protected routes
router.get("/", protect, getBookings);

router.put("/:id/status", protect, updateBookingStatus);

module.exports = router;  