const express = require("express");
const rateLimit = require("express-rate-limit");

const {
  loginAdmin,
  getMe,
  changePassword,
  updateProfileImage,
  forgotPassword,
  resetPassword,
} = require("../controller/authcontroller");

const {
  protect,
} = require("../middleware/authmiddleware");
const { uploadProfileImage } = require("../middleware/uploadmiddleware");

const router = express.Router();

// Rate limiter for forgot-password to prevent abuse
const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    success: false,
    message: "Too many password reset requests. Please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post("/login", loginAdmin);

router.get("/me", protect, getMe);

router.put("/change-password", protect, changePassword);

router.put("/profile-image", protect, uploadProfileImage.single("image"), updateProfileImage);

// Public password recovery routes
router.post("/forgot-password", forgotPasswordLimiter, forgotPassword);
router.post("/reset-password", resetPassword);

module.exports = router;