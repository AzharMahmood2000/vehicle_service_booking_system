const express = require("express");

const {
  loginAdmin,
  getMe,
} = require("../controller/authcontroller");

const {
  protect,
} = require("../middleware/authmiddleware");

const router = express.Router();

router.post("/login", loginAdmin);

router.get("/me", protect, getMe);

module.exports = router;