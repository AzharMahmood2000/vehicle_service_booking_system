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

module.exports = {
  getServiceBays,
  updateServiceBayStatus,
};