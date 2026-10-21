// adminRoutes.js - URLs only for admins
const express = require("express");
const router = express.Router();
const { getDashboard, getUsers } = require("../controllers/adminController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

router.get("/dashboard", protect, adminOnly, getDashboard); // GET /api/admin/dashboard
router.get("/users", protect, adminOnly, getUsers);         // GET /api/admin/users

module.exports = router;