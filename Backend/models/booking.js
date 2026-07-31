const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    referenceNumber: {
      type: String,
      required: [true, "Booking reference number is required"],
      unique: true,
      trim: true,
    },

    customerName: {
      type: String,
      required: [true, "Customer name is required"],
      trim: true,
    },

    phoneNumber: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
    },

    vehicleNumber: {
      type: String,
      required: [true, "Vehicle number is required"],
      trim: true,
      uppercase: true,
    },

    vehicleModel: {
      type: String,
      required: [true, "Vehicle model is required"],
      trim: true,
    },

    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ServiceCategory",
      required: [true, "Service is required"],
    },

    serviceName: {
      type: String,
      required: [true, "Service name is required"],
      trim: true,
    },

    estimatedDuration: {
      type: Number,
      required: [true, "Estimated duration is required"],
      min: [1, "Estimated duration must be greater than 0"],
    },

    appointmentDate: {
      type: String,
      required: [true, "Appointment date is required"],
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

    serviceBay: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ServiceBay",
      required: [true, "Service bay is required"],
    },

    status: {
      type: String,
      enum: [
        "REQUEST PENDING",
        "APPROVED",
        "IN PROGRESS",
        "COMPLETED",
        "REJECTED",
        "CANCELLED",
      ],
      default: "REQUEST PENDING",
    },

    adminNotificationRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Booking = mongoose.model("Booking", bookingSchema);

module.exports = Booking;