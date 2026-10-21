// Parking.js - one parking facility (e.g. "Vasai Station Parking")
const mongoose = require("mongoose");

const parkingSchema = new mongoose.Schema(
  {
    parkingName: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    totalSlots: { type: Number, required: true, min: 1 },
    availableSlots: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ["Open", "Closed"], default: "Open" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Parking", parkingSchema);