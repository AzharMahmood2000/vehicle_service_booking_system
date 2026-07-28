const express = require("express");

const {
  getServiceCategories,
  createServiceCategory,
  updateServiceCategory,
  deleteServiceCategory,
} = require("../controller/ServiceCategorycontroller");

const {
  protect,
} = require("../middleware/authmiddleware");

const router = express.Router();

// Public route
router.get("/", getServiceCategories);

// Admin protected routes
router.post("/", protect, createServiceCategory);

router.put("/:id", protect, updateServiceCategory);

router.delete("/:id", protect, deleteServiceCategory);

module.exports = router;