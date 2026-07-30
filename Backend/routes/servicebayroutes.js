const express = require("express");

const {
  getServiceBays,
  createServiceBay,
  updateServiceBayName,
  updateServiceBayStatus,
  deactivateServiceBay,
  reactivateServiceBay,
} = require("../controller/servicebaycontroller");

const {
  protect,
} = require("../middleware/authmiddleware");

const router = express.Router();

// Admin protected routes
router.get("/", protect, getServiceBays);

router.post("/", protect, createServiceBay);

router.put("/:id/name", protect, updateServiceBayName);

router.put("/:id/status", protect, updateServiceBayStatus);

router.put("/:id/deactivate", protect, deactivateServiceBay);

router.put("/:id/reactivate", protect, reactivateServiceBay);

module.exports = router;