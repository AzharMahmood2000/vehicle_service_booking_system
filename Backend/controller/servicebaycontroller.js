const ServiceBay = require("../models/servicebay");

const getServiceBays = async (req, res) => {
  try {
    const bays = await ServiceBay.find().sort({
      name: 1,
    });

    return res.status(200).json({
      success: true,
      count: bays.length,
      bays,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch service bays",
      error: error.message,
    });
  }
};

const createServiceBay = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Service bay name is required",
      });
    }

    const bay = await ServiceBay.create({
      name: name.trim(),
      status: "AVAILABLE",
      active: true,
    });

    return res.status(201).json({
      success: true,
      message: "Service bay created successfully",
      bay,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "A service bay with this name already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to create service bay",
      error: error.message,
    });
  }
};

const updateServiceBayName = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Service bay name is required",
      });
    }

    const bay = await ServiceBay.findByIdAndUpdate(
      req.params.id,
      {
        name: name.trim(),
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!bay) {
      return res.status(404).json({
        success: false,
        message: "Service bay not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Service bay name updated successfully",
      bay,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid service bay ID",
      });
    }

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "A service bay with this name already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to update service bay name",
      error: error.message,
    });
  }
};

const updateServiceBayStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const validStatuses = [
      "AVAILABLE",
      "MAINTENANCE",
      "OUT_OF_SERVICE",
    ];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message:
          "Status must be AVAILABLE, MAINTENANCE, or OUT_OF_SERVICE",
      });
    }

    const bay = await ServiceBay.findByIdAndUpdate(
      req.params.id,
      { status },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!bay) {
      return res.status(404).json({
        success: false,
        message: "Service bay not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Service bay status updated successfully",
      bay,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid service bay ID",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to update service bay status",
      error: error.message,
    });
  }
};

const deactivateServiceBay = async (req, res) => {
  try {
    const bay = await ServiceBay.findByIdAndUpdate(
      req.params.id,
      {
        active: false,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!bay) {
      return res.status(404).json({
        success: false,
        message: "Service bay not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Service bay deactivated successfully",
      bay,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid service bay ID",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to deactivate service bay",
      error: error.message,
    });
  }
};

const reactivateServiceBay = async (req, res) => {
  try {
    const bay = await ServiceBay.findByIdAndUpdate(
      req.params.id,
      {
        active: true,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!bay) {
      return res.status(404).json({
        success: false,
        message: "Service bay not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Service bay reactivated successfully",
      bay,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid service bay ID",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to reactivate service bay",
      error: error.message,
    });
  }
};

module.exports = {
  getServiceBays,
  createServiceBay,
  updateServiceBayName,
  updateServiceBayStatus,
  deactivateServiceBay,
  reactivateServiceBay,
};