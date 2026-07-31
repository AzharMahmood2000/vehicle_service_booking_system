const express = require("express");

const {
  getServiceCategories,
  getAllServiceCategories,
  createServiceCategory,
  updateServiceCategory,
  deleteServiceCategory,
  uploadServiceImageFile,
} = require("../controller/ServiceCategorycontroller");

const {
  protect,
} = require("../middleware/authmiddleware");

const { uploadServiceImage } = require("../middleware/uploadmiddleware");

const router = express.Router();

// Public route
router.get("/", getServiceCategories);

// Admin protected route - active + inactive services
router.get(
  "/admin/all",
  protect,
  getAllServiceCategories
);

// Admin protected routes
router.post(
  "/",
  protect,
  createServiceCategory
);

router.put(
  "/:id",
  protect,
  updateServiceCategory
);

router.delete(
  "/:id",
  protect,
  deleteServiceCategory
);

router.post(
  "/upload-image",
  protect,
  uploadServiceImage.single("image"),
  uploadServiceImageFile
);

module.exports = router;