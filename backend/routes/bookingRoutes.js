// bookingRoutes.js - URLs for bookings
const express = require("express");
const router = express.Router();
const c = require("../controllers/bookingController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

router.post("/", protect, c.createBooking);            // POST /api/bookings          book a slot
router.get("/my", protect, c.getMyBookings);           // GET  /api/bookings/my       my history
router.get("/", protect, adminOnly, c.getAllBookings); // GET  /api/bookings          all bookings (admin)
router.get("/:id", protect, c.getBookingById);         // GET  /api/bookings/:id      one booking
router.put("/:id/cancel", protect, c.cancelBooking);   // PUT  /api/bookings/:id/cancel

module.exports = router;