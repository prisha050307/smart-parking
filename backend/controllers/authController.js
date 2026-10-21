// authController.js - register and login logic
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// ---------- REGISTER ----------
// Runs when the frontend sends: POST /api/auth/register
exports.register = async (req, res) => {
  try {
    // data sent from the registration form
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required." });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters." });
    }

    // is this email already used?
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ message: "This email is already registered." });
    }

    // scramble the password (hashing) so the real one is never saved
    const hashedPassword = await bcrypt.hash(password, 10);

    // save the new user in MongoDB (role is always "user" here)
    await User.create({ name, email, password: hashedPassword, role: "user" });

    res.status(201).json({ message: "Registration successful! Please login." });
  } catch (error) {
    res.status(500).json({ message: "Server error. Please try again." });
  }
};

// ---------- LOGIN ----------
// Runs when the frontend sends: POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. find the user by email
    const user = await User.findOne({ email: (email || "").toLowerCase() });
    if (!user) return res.status(400).json({ message: "Invalid email or password." });

    // 2. compare the typed password with the scrambled one in the database
    const isMatch = await bcrypt.compare(password || "", user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid email or password." });

    // 3. create a token (JWT) that proves this user is logged in
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: "1d", // token works for 1 day
    });

    // 4. send the token and basic user info (never send the password)
    res.json({
      message: "Login successful.",
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error. Please try again." });
  }
};