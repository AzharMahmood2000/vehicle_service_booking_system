const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");
const serviceCategoryRoutes = require("./routes/servicecategoryroutes");
const serviceBayRoutes = require("./routes/servicebayroutes");
const bookingRoutes = require("./routes/bookingroutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/services", serviceCategoryRoutes);
app.use("/api/bays", serviceBayRoutes);
app.use("/api/bookings", bookingRoutes);

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "VehicleCare API is running",
  });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();