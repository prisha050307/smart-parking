// parkingRoutes.js - URLs for parking facilities and slots
const express = require("express");
const router = express.Router();
const c = require("../controllers/parkingController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

// Any logged-in user (protect checks the token first)
router.get("/", protect, c.getAllParkings);        // GET /api/parking
router.get("/:id", protect, c.getParkingById);     // GET /api/parking/:id
router.get("/:id/slots", protect, c.getSlots);     // GET /api/parking/:id/slots

// Admin only (protect checks login, then adminOnly checks the role)
router.post("/", protect, adminOnly, c.addParking);                        // POST   /api/parking
router.delete("/:id", protect, adminOnly, c.deleteParking);                // DELETE /api/parking/:id
router.post("/:id/slots", protect, adminOnly, c.addSlot);                  // POST   /api/parking/:id/slots
router.put("/:id/slots/:slotId", protect, adminOnly, c.updateSlotStatus);  // PUT    /api/parking/:id/slots/:slotId

module.exports = router;