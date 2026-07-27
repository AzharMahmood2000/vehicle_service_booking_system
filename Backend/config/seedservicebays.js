require("dotenv").config();

const mongoose = require("mongoose");
const ServiceBay = require("../models/servicebay");

const seedServiceBays = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const defaultBays = [
      { name: "Bay 1", status: "AVAILABLE" },
      { name: "Bay 2", status: "AVAILABLE" },
      { name: "Bay 3", status: "AVAILABLE" },
      { name: "Bay 4", status: "AVAILABLE" },
    ];

    for (const bay of defaultBays) {
      await ServiceBay.updateOne(
        { name: bay.name },
        { $setOnInsert: bay },
        { upsert: true }
      );
    }

    console.log("Default service bays created successfully");

    await mongoose.connection.close();
  } catch (error) {
    console.error("Failed to create service bays:", error.message);
    await mongoose.connection.close();
    process.exit(1);
  }
};

seedServiceBays();