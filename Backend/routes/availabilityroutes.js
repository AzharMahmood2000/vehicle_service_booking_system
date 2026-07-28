const express = require("express");

const {
  getAvailableSlots,
} = require("../controller/availabilitycontroller");

const router = express.Router();

router.get("/slots", getAvailableSlots);

module.exports = router;