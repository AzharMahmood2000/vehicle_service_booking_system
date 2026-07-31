const ServiceCategory = require("../models/servicecategory");

const getServiceCategories = async (req, res) => {
  try {
    const services = await ServiceCategory.find({ active: true }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      count: services.length,
      services,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch service categories",
      error: error.message,
    });
  }
};

const getAllServiceCategories = async (req, res) => {
  try {
    const services = await ServiceCategory.find().sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      count: services.length,
      services,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch all service categories",
      error: error.message,
    });
  }
};

const createServiceCategory = async (req, res) => {
  try {
    const {
      title,
      description,
      durationMins,
      price,
      category,
      tag,
      image,
      active,
    } = req.body;

    if (
      !title ||
      !description ||
      durationMins === undefined ||
      price === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "Title, description, duration and price are required",
      });
    }

    const service = await ServiceCategory.create({
      title,
      description,
      durationMins,
      price,
      category,
      tag,
      image,
      active,
    });

    return res.status(201).json({
      success: true,
      message: "Service category created successfully",
      service,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "A service category with this title already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to create service category",
      error: error.message,
    });
  }
};

const updateServiceCategory = async (req, res) => {
  try {
    const allowedFields = [
      "title",
      "description",
      "durationMins",
      "price",
      "category",
      "tag",
      "image",
      "active",
    ];

    const updates = {};

    allowedFields.forEach((field) => {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        updates[field] = req.body[field];
      }
    });

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid fields provided for update",
      });
    }

    const service = await ServiceCategory.findByIdAndUpdate(
      req.params.id,
      updates,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service category not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Service category updated successfully",
      service,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid service category ID",
      });
    }

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "A service category with this title already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to update service category",
      error: error.message,
    });
  }
};

const deleteServiceCategory = async (req, res) => {
  try {
    const service = await ServiceCategory.findByIdAndUpdate(
      req.params.id,
      { active: false },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service category not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Service category deleted successfully",
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid service category ID",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to delete service category",
      error: error.message,
    });
  }
};

const uploadServiceImageFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No image file uploaded" });
    }

    const filePath = `/uploads/services/${req.file.filename}`;

    return res.status(200).json({
      success: true,
      image: filePath,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to upload service image",
      error: error.message,
    });
  }
};

module.exports = {
  getServiceCategories,
  getAllServiceCategories,
  createServiceCategory,
  updateServiceCategory,
  deleteServiceCategory,
  uploadServiceImageFile,
};