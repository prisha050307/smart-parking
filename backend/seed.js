// seed.js - adds sample data. Run it with:  npm run seed
// WARNING: it deletes all parkings, slots and bookings first (users are kept).
require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("./models/User");
const Parking = require("./models/Parking");
const ParkingSlot = require("./models/ParkingSlot");
const Booking = require("./models/Booking");
const updateAvailableSlots = require("./utils/updateAvailableSlots");

// the 3 sample parkings
const parkings = [
  { parkingName: "Vasai Station Parking", location: "Vasai", slots: 20 },
  { parkingName: "Evershine Mall Parking", location: "Vasai", slots: 30 },
  { parkingName: "Railway Road Parking", location: "Vasai", slots: 15 },
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);

  // clear old parking data
  await Booking.deleteMany();
  await ParkingSlot.deleteMany();
  await Parking.deleteMany();

  for (const p of parkings) {
    // create the parking
    const parking = await Parking.create({
      parkingName: p.parkingName,
      location: p.location,
      totalSlots: p.slots,
      availableSlots: p.slots,
    });

    // create its slots A01, A02 ...
    const slots = [];
    for (let i = 1; i <= p.slots; i++) {
      slots.push({
        slotNumber: "A" + String(i).padStart(2, "0"),
        parkingId: parking._id,
        // every 6th slot is Occupied so the demo looks real
        status: i % 6 === 0 ? "Occupied" : "Available",
      });
    }
    await ParkingSlot.insertMany(slots);
    await updateAvailableSlots(parking._id);
  }

  // create a sample admin (only if it does not exist yet)
  const adminEmail = "admin@smartparking.com";
  const existing = await User.findOne({ email: adminEmail });
  if (!existing) {
    await User.create({
      name: "Admin",
      email: adminEmail,
      password: await bcrypt.hash("Admin@123", 10),
      role: "admin",
    });
    console.log("Admin created: " + adminEmail + " / Admin@123  (change this password later!)");
  }

  console.log("Sample parking data added.");
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});