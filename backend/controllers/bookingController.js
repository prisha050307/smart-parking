// bookingController.js - book a slot, see bookings, cancel a booking
const QRCode = require("qrcode");
const Booking = require("../models/Booking");
const ParkingSlot = require("../models/ParkingSlot");
const Parking = require("../models/Parking");
const updateAvailableSlots = require("../utils/updateAvailableSlots");

// Makes booking IDs: SP1001, SP1002, SP1003 ...
async function makeBookingId() {
  const count = await Booking.countDocuments();
  return "SP" + (1001 + count);
}

// ---------- POST /api/bookings ----------
// React sends: { parkingId, slotId }
exports.createBooking = async (req, res) => {
  try {
    const { parkingId, slotId } = req.body;

    // (the protect middleware already checked the token, so req.user exists)

    // STEP 1: does this slot exist?
    const slot = await ParkingSlot.findOne({ _id: slotId, parkingId });
    if (!slot) return res.status(404).json({ message: "Slot not found." });

    // STEP 2: check availability AND reserve it in ONE database command.
    // Meaning: "find this slot ONLY IF it is Available, and make it Reserved".
    // If two users click at the same moment, only one of them gets a result.
    // The other one gets null.
    const reservedSlot = await ParkingSlot.findOneAndUpdate(
      { _id: slotId, parkingId, status: "Available" },
      { status: "Reserved" },
      { new: true }
    );

    // null means somebody else already took it
    if (!reservedSlot) {
      return res.status(400).json({ message: "Sorry, this slot is no longer available." });
    }

    // STEP 3: create the booking
    try {
      const parking = await Parking.findById(parkingId);
      const bookingId = await makeBookingId();

      // the text that will be hidden inside the QR code
      const qrText =
        "Booking ID: " + bookingId +
        "\nParking: " + parking.parkingName +
        "\nSlot: " + reservedSlot.slotNumber;
      const qrCode = await QRCode.toDataURL(qrText); // the QR image, as text

      const booking = await Booking.create({
        userId: req.user._id,
        parkingId,
        slotId,
        bookingId,
        qrCode,
      });

      // STEP 4: update the "available" number on the parking
      await updateAvailableSlots(parkingId);

      res.status(201).json({ message: "Booking successful!", booking });
    } catch (innerError) {
      // something failed after reserving, so make the slot Available again
      await ParkingSlot.findByIdAndUpdate(slotId, { status: "Available" });
      throw innerError;
    }
  } catch (error) {
     console.error("BOOKING ERROR:", error);
    res.status(500).json({ message: "Booking failed. Please try again." });
  }
};

// ---------- GET /api/bookings/my ----------
// Booking history of the logged-in user
exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user._id })
      .populate("parkingId", "parkingName location") // replace the id with real parking data
      .populate("slotId", "slotNumber")
      .sort({ createdAt: -1 }); // newest first
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: "Server error." });
  }
};

// ---------- GET /api/bookings  (admin) ----------
// All bookings of all users
exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("userId", "name email")
      .populate("parkingId", "parkingName")
      .populate("slotId", "slotNumber")
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: "Server error." });
  }
};

// ---------- GET /api/bookings/:id ----------
// One booking (used by the confirmation page)
exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("parkingId", "parkingName location")
      .populate("slotId", "slotNumber");

    if (!booking) return res.status(404).json({ message: "Booking not found." });

    // a normal user can only see their own booking
    if (booking.userId.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied." });
    }
    res.json(booking);
  } catch (error) {
    res.status(404).json({ message: "Booking not found." });
  }
};

// ---------- PUT /api/bookings/:id/cancel ----------
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found." });

    // only the owner can cancel
    if (booking.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Access denied." });
    }
    if (booking.bookingStatus === "Cancelled") {
      return res.status(400).json({ message: "This booking is already cancelled." });
    }

    // 1. booking becomes Cancelled
    booking.bookingStatus = "Cancelled";
    await booking.save();

    // 2. the slot becomes Available again, so another user can book it
    await ParkingSlot.findByIdAndUpdate(booking.slotId, { status: "Available" });
    await updateAvailableSlots(booking.parkingId);

    res.json({ message: "Slot successfully cancelled.", booking });
  } catch (error) {
    res.status(500).json({ message: "Server error." });
  }
};