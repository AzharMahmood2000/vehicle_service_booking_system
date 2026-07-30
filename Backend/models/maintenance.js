const mongoose = require("mongoose");

const maintenanceSchema = new mongoose.Schema(
  {
    serviceBay: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ServiceBay",
      required: [true, "Service bay is required"],
    },

    maintenanceDate: {
      type: String,
      required: [true, "Maintenance date is required"],
      trim: true,
    },

    startTime: {
      type: String,
      required: [true, "Start time is required"],
      trim: true,
    },

    endTime: {
      type: String,
      required: [true, "End time is required"],
      trim: true,
    },

    reason: {
      type: String,
      trim: true,
      default: "",
    },

    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Maintenance = mongoose.model(
  "Maintenance",
  maintenanceSchema
);

module.exports = Maintenance;