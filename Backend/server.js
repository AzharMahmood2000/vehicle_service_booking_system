const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");
const serviceCategoryRoutes = require("./routes/servicecategoryroutes");
const serviceBayRoutes = require("./routes/servicebayroutes");
const bookingRoutes = require("./routes/bookingroutes");
const availabilityRoutes = require("./routes/availabilityroutes");
const authRoutes = require("./routes/authroutes");
const contactRequestRoutes = require("./routes/contactrequestroutes");
const settingRoutes = require("./routes/settingroutes");
const dashboardRoutes = require("./routes/dashboardroutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/services", serviceCategoryRoutes);
app.use("/api/bays", serviceBayRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/availability", availabilityRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/contact", contactRequestRoutes);
app.use("/api/settings", settingRoutes);
app.use("/api/dashboard", dashboardRoutes);
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