const express = require("express");

const {
  getSetting,
  updateSetting,
} = require("../controller/settingcontroller");

const {
  protect,
} = require("../middleware/authmiddleware");

const router = express.Router();

// Public route
router.get("/:key", getSetting);

// Admin protected route
router.put("/:key", protect, updateSetting);

module.exports = router;