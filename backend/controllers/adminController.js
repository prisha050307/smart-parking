// adminController.js - numbers for the admin dashboard and the list of users
const Parking = require("../models/Parking");
const ParkingSlot = require("../models/ParkingSlot");
const User = require("../models/User");
const Booking = require("../models/Booking");

// ---------- GET /api/admin/dashboard ----------
// Counts things in the database and sends the numbers
exports.getDashboard = async (req, res) => {
  try {
    const stats = {
      totalParkings: await Parking.countDocuments(),
      totalSlots: await ParkingSlot.countDocuments(),
      availableSlots: await ParkingSlot.countDocuments({ status: "Available" }),
      reservedSlots: await ParkingSlot.countDocuments({ status: "Reserved" }),
      occupiedSlots: await ParkingSlot.countDocuments({ status: "Occupied" }),
      totalUsers: await User.countDocuments({ role: "user" }),
      totalBookings: await Booking.countDocuments(),
    };
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: "Server error." });
  }
};

// ---------- GET /api/admin/users ----------
// List of registered users (the password is NOT sent)
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find({ role: "user" }).select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error." });
  }
};