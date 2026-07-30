const Maintenance = require("../models/maintenance");
const ServiceBay = require("../models/servicebay");

const {
  timeToMinutes,
  hasTimeConflict,
} = require("../utils/timecalculations");

const getMaintenances = async (req, res) => {
  try {
    const maintenances = await Maintenance.find({
      active: true,
    })
      .populate("serviceBay", "name status")
      .sort({
        maintenanceDate: 1,
        startTime: 1,
      });

    return res.status(200).json({
      success: true,
      count: maintenances.length,
      maintenances,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch maintenance periods",
      error: error.message,
    });
  }
};

const createMaintenance = async (req, res) => {
  try {
    const {
      serviceBay,
      maintenanceDate,
      startTime,
      endTime,
      reason,
    } = req.body;

    if (
      !serviceBay ||
      !maintenanceDate ||
      !startTime ||
      !endTime
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Service bay, maintenance date, start time and end time are required",
      });
    }

    const datePattern = /^\d{4}-\d{2}-\d{2}$/;
    const timePattern = /^([01]\d|2[0-3]):([0-5]\d)$/;

    if (!datePattern.test(maintenanceDate)) {
      return res.status(400).json({
        success: false,
        message:
          "Maintenance date must use YYYY-MM-DD format",
      });
    }

    if (
      !timePattern.test(startTime) ||
      !timePattern.test(endTime)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Start time and end time must use HH:MM format",
      });
    }

    if (
      timeToMinutes(startTime) >=
      timeToMinutes(endTime)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "End time must be later than start time",
      });
    }

    const bay = await ServiceBay.findById(serviceBay);

    if (!bay) {
      return res.status(404).json({
        success: false,
        message: "Service bay not found",
      });
    }

    const existingMaintenances =
      await Maintenance.find({
        serviceBay,
        maintenanceDate,
        active: true,
      });

    const conflictExists =
      existingMaintenances.some((maintenance) =>
        hasTimeConflict(
          startTime,
          endTime,
          maintenance.startTime,
          maintenance.endTime
        )
      );

    if (conflictExists) {
      return res.status(409).json({
        success: false,
        message:
          "This service bay already has maintenance during the selected time",
      });
    }

    const maintenance =
      await Maintenance.create({
        serviceBay,
        maintenanceDate,
        startTime,
        endTime,
        reason: reason || "",
        active: true,
      });

    await maintenance.populate(
      "serviceBay",
      "name status"
    );

    return res.status(201).json({
      success: true,
      message:
        "Maintenance period created successfully",
      maintenance,
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
      message:
        "Failed to create maintenance period",
      error: error.message,
    });
  }
};

const deactivateMaintenance = async (req, res) => {
  try {
    const maintenance =
      await Maintenance.findByIdAndUpdate(
        req.params.id,
        {
          active: false,
        },
        {
          new: true,
          runValidators: true,
        }
      ).populate(
        "serviceBay",
        "name status"
      );

    if (!maintenance) {
      return res.status(404).json({
        success: false,
        message: "Maintenance period not found",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Maintenance period deactivated successfully",
      maintenance,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid maintenance ID",
      });
    }

    return res.status(500).json({
      success: false,
      message:
        "Failed to deactivate maintenance period",
      error: error.message,
    });
  }
};

module.exports = {
  getMaintenances,
  createMaintenance,
  deactivateMaintenance,
};