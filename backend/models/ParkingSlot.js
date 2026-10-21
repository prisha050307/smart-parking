// ParkingSlot.js - one slot (like A03) that belongs to ONE parking
const mongoose = require("mongoose");

const slotSchema = new mongoose.Schema({
  slotNumber: { type: String, required: true }, // e.g. "A03"
  // parkingId links this slot to its Parking (like a foreign key in SQL)
  parkingId: { type: mongoose.Schema.Types.ObjectId, ref: "Parking", required: true },
  status: { type: String, enum: ["Available", "Reserved", "Occupied"], default: "Available" },
});

// The same slot number cannot repeat inside the same parking
slotSchema.index({ parkingId: 1, slotNumber: 1 }, { unique: true });

module.exports = mongoose.model("ParkingSlot", slotSchema);