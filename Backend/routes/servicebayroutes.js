const express = require("express");

const {
  getServiceBays,
  updateServiceBayStatus,
} = require("../controller/servicebaycontroller");

const router = express.Router();

router.get("/", getServiceBays);

router.put("/:id/status", updateServiceBayStatus);

module.exports = router;