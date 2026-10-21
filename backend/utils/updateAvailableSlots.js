// updateAvailableSlots.js
// Counts how many slots are "Available" in one parking
// and saves that number inside the Parking document.
const Parking = require("../models/Parking");
const ParkingSlot = require("../models/ParkingSlot");

async function updateAvailableSlots(parkingId) {
  // count the slots of this parking that are Available
  const available = await ParkingSlot.countDocuments({ parkingId, status: "Available" });
  // count all slots of this parking
  const total = await ParkingSlot.countDocuments({ parkingId });

  // save both numbers in the Parking document
  await Parking.findByIdAndUpdate(parkingId, { availableSlots: available, totalSlots: total });
}

module.exports = updateAvailableSlots;