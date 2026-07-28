const express = require("express");

const {
  getServiceBays,
  updateServiceBayStatus,
} = require("../controller/servicebaycontroller");

const {
  protect,
} = require("../middleware/authmiddleware");

const router = express.Router();

// Admin protected routes
router.get("/", protect, getServiceBays);

router.put("/:id/status", protect, updateServiceBayStatus);

module.exports = router;