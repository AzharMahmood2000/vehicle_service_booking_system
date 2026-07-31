const express = require("express");

const {
  loginAdmin,
  getMe,
  changePassword,
  updateProfileImage,
} = require("../controller/authcontroller");

const {
  protect,
} = require("../middleware/authmiddleware");
const { uploadProfileImage } = require("../middleware/uploadmiddleware");

const router = express.Router();

router.post("/login", loginAdmin);

router.get("/me", protect, getMe);

router.put("/change-password", protect, changePassword);

router.put("/profile-image", protect, uploadProfileImage.single("image"), updateProfileImage);

module.exports = router;