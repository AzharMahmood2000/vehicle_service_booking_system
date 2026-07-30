const express = require("express");

const {
  getMaintenances,
  createMaintenance,
  deactivateMaintenance,
} = require("../controller/maintenancecontroller");

const {
  protect,
} = require("../middleware/authmiddleware");

const router = express.Router();

// Admin protected maintenance routes
router.get("/", protect, getMaintenances);
router.post("/", protect, createMaintenance);
router.put("/:id/deactivate", protect, deactivateMaintenance);

module.exports = router;