const mongoose = require("mongoose");

const serviceCategorySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Service title is required"],
      trim: true,
      unique: true,
    },

    description: {
      type: String,
      required: [true, "Service description is required"],
      trim: true,
    },

    durationMins: {
      type: Number,
      required: [true, "Service duration is required"],
      min: [1, "Service duration must be greater than 0"],
    },

    price: {
      type: Number,
      required: [true, "Service price is required"],
      min: [0, "Service price cannot be negative"],
    },

    category: {
      type: String,
      enum: [
        "Maintenance",
        "Diagnostics",
        "Repairs",
        "AC & Heating",
      ],
      default: "Maintenance",
      trim: true,
    },

    tag: {
      type: String,
      trim: true,
      default: "",
    },

    image: {
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

const ServiceCategory = mongoose.model(
  "ServiceCategory",
  serviceCategorySchema
);

module.exports = ServiceCategory;