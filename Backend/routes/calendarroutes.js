const express = require("express");

const {
  getCalendarBookings,
} = require("../controller/calendarcontroller");

const {
  protect,
} = require("../middleware/authmiddleware");

const router = express.Router();

// Admin protected calendar bookings
router.get("/bookings", protect, getCalendarBookings);

module.exports = router;