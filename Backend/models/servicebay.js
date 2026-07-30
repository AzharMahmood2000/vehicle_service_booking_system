const mongoose = require("mongoose");

const serviceBaySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Service bay name is required"],
      trim: true,
      unique: true,
    },

    status: {
      type: String,
      enum: ["AVAILABLE", "MAINTENANCE", "OUT_OF_SERVICE"],
      default: "AVAILABLE",
    },

    active: {
      type: Boolean,
      default: true,
    },

    bookingLockVersion: {
      type: Number,
      default: 0,
      select: false, // Internal only, hide from responses
    },
  },
  {
    timestamps: true,
  }
);

const ServiceBay = mongoose.model("ServiceBay", serviceBaySchema);

module.exports = ServiceBay;