const express = require("express");

const {
  getServiceCategories,
  createServiceCategory,
  updateServiceCategory,
  deleteServiceCategory,
} = require("../controller/ServiceCategorycontroller");

const router = express.Router();

router.get("/", getServiceCategories);

router.post("/", createServiceCategory);

router.put("/:id", updateServiceCategory);

router.delete("/:id", deleteServiceCategory);

module.exports = router;