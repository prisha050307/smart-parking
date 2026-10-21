// parkingController.js - everything about parking facilities and slots
const Parking = require("../models/Parking");
const ParkingSlot = require("../models/ParkingSlot");
const Booking = require("../models/Booking");
const updateAvailableSlots = require("../utils/updateAvailableSlots");

// Makes slot names like A01, A02 ... from a number
function makeSlotNumber(n) {
  return "A" + String(n).padStart(2, "0");
}

// ---------- GET /api/parking ----------
// Send the list of all parking facilities
exports.getAllParkings = async (req, res) => {
  try {
    const parkings = await Parking.find().sort({ createdAt: 1 });
    res.json(parkings);
  } catch (error) {
    res.status(500).json({ message: "Server error." });
  }
};

// ---------- GET /api/parking/:id ----------
// Send ONE parking (the id comes from the URL)
exports.getParkingById = async (req, res) => {
  try {
    const parking = await Parking.findById(req.params.id);
    if (!parking) return res.status(404).json({ message: "Parking not found." });
    res.json(parking);
  } catch (error) {
    res.status(404).json({ message: "Parking not found." });
  }
};

// ---------- GET /api/parking/:id/slots ----------
// Send the LATEST status of every slot of that parking
exports.getSlots = async (req, res) => {
  try {
    const slots = await ParkingSlot.find({ parkingId: req.params.id })
      .collation({ locale: "en", numericOrdering: true }) // keeps A2 before A10
      .sort({ slotNumber: 1 });
    res.json(slots);
  } catch (error) {
    res.status(404).json({ message: "Parking not found." });
  }
};

// ---------- POST /api/parking  (admin) ----------
// Create a parking AND all its slots automatically
exports.addParking = async (req, res) => {
  try {
    const { parkingName, location, numberOfSlots } = req.body;
    const count = Number(numberOfSlots);

    if (!parkingName || !location || !count || count < 1 || count > 200) {
      return res.status(400).json({ message: "Enter name, location and slots (1 to 200)." });
    }

    // 1. create the parking
    const parking = await Parking.create({
      parkingName,
      location,
      totalSlots: count,
      availableSlots: count,
    });

    // 2. build A01, A02 ... and save them all at once
    const slots = [];
    for (let i = 1; i <= count; i++) {
      slots.push({ slotNumber: makeSlotNumber(i), parkingId: parking._id });
    }
    await ParkingSlot.insertMany(slots);

    res.status(201).json({ message: "Parking facility added successfully.", parking });
  } catch (error) {
    res.status(500).json({ message: "Server error." });
  }
};

// ---------- DELETE /api/parking/:id  (admin) ----------
exports.deleteParking = async (req, res) => {
  try {
    const parking = await Parking.findById(req.params.id);
    if (!parking) return res.status(404).json({ message: "Parking not found." });

    // active bookings of this parking become Cancelled
    await Booking.updateMany(
      { parkingId: parking._id, bookingStatus: "Confirmed" },
      { bookingStatus: "Cancelled" }
    );
    await ParkingSlot.deleteMany({ parkingId: parking._id }); // delete its slots
    await parking.deleteOne();                                // delete the parking

    res.json({ message: "Parking facility deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: "Server error." });
  }
};

// ---------- POST /api/parking/:id/slots  (admin) ----------
// Add ONE more slot to a parking
exports.addSlot = async (req, res) => {
  try {
    const parking = await Parking.findById(req.params.id);
    if (!parking) return res.status(404).json({ message: "Parking not found." });

    const count = await ParkingSlot.countDocuments({ parkingId: parking._id });
    const slot = await ParkingSlot.create({
      slotNumber: makeSlotNumber(count + 1),
      parkingId: parking._id,
    });
    await updateAvailableSlots(parking._id);

    res.status(201).json({ message: "Slot " + slot.slotNumber + " added.", slot });
  } catch (error) {
    res.status(500).json({ message: "Server error." });
  }
};

// ---------- PUT /api/parking/:id/slots/:slotId  (admin) ----------
// Mark a slot Available or Occupied
exports.updateSlotStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!["Available", "Occupied"].includes(status)) {
      return res.status(400).json({ message: "Admin can set only Available or Occupied." });
    }

    const slot = await ParkingSlot.findOne({ _id: req.params.slotId, parkingId: req.params.id });
    if (!slot) return res.status(404).json({ message: "Slot not found." });

    // a Reserved slot belongs to a user's booking, so it must be cancelled first
    if (slot.status === "Reserved") {
      return res.status(400).json({ message: "Slot is reserved. Cancel the booking first." });
    }

    slot.status = status;
    await slot.save();
    await updateAvailableSlots(req.params.id);

    res.json({ message: "Slot " + slot.slotNumber + " is now " + status + ".", slot });
  } catch (error) {
    res.status(500).json({ message: "Server error." });
  }
};