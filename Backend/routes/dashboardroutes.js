const express = require("express");

const {
  getDashboardSummary,
} = require("../controller/dashboardcontroller");

const {
  protect,
} = require("../middleware/authmiddleware");

const router = express.Router();

// Admin protected dashboard summary
router.get("/summary", protect, getDashboardSummary);

module.exports = router;