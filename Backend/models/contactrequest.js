const mongoose = require("mongoose");

const contactRequestSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },

    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
    },

    message: {
      type: String,
      required: [true, "Message is required"],
      trim: true,
    },

    status: {
      type: String,
      enum: [
        "PENDING",
        "CONTACTED",
        "RESOLVED",
      ],
      default: "PENDING",
    },
  },
  {
    timestamps: true,
  }
);

const ContactRequest = mongoose.model(
  "ContactRequest",
  contactRequestSchema
);

module.exports = ContactRequest;