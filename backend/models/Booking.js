// Booking.js - connects a User + a Parking + a ParkingSlot
const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    parkingId: { type: mongoose.Schema.Types.ObjectId, ref: "Parking", required: true },
    slotId: { type: mongoose.Schema.Types.ObjectId, ref: "ParkingSlot", required: true },
    bookingId: { type: String, required: true, unique: true }, // friendly ID like "SP1001"
    bookingDate: { type: Date, default: Date.now },
    bookingStatus: { type: String, enum: ["Confirmed", "Cancelled"], default: "Confirmed" },
    qrCode: { type: String }, // the QR image, saved as text
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);