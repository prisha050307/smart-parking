// server.js - starts the server, connects to MongoDB, and links the routes
require("dotenv").config(); // reads the .env file
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();

app.use(cors());         // lets the React app call this server
app.use(express.json()); // lets the server read JSON data sent by React

// Test page
app.get("/", (req, res) => {
  res.send("Smart Parking backend is running!");
});

// Any URL starting with /api/auth goes to authRoutes.js
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/parking", require("./routes/parkingRoutes"));
app.use("/api/bookings", require("./routes/bookingRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));

const PORT = process.env.PORT || 5000;

// Connect to MongoDB first. Only if it works, start the server.
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => console.log("Server running on port " + PORT));
  })
  .catch((err) => {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
  });