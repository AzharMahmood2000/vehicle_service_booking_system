const express = require("express");

const {
  createContactRequest,
  getContactRequests,
  updateContactRequestStatus,
  markContactNotificationRead,
} = require("../controller/contactrequestcontroller");

const {
  protect,
} = require("../middleware/authmiddleware");

const router = express.Router();

// Public route
router.post("/", createContactRequest);

// Admin protected routes
router.get("/", protect, getContactRequests);
 
router.put("/:id/status", protect, updateContactRequestStatus);

router.put("/:id/notification-read", protect, markContactNotificationRead);

module.exports = router;