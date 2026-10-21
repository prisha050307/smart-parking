// authMiddleware.js - checks the token BEFORE the real work starts
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// protect: the user must be logged in
async function protect(req, res, next) {
  try {
    // React sends the token in a header that looks like:  Authorization: Bearer <token>
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Please login." });
    }
    const token = header.split(" ")[1]; // take only the token part

    // check that the token is real and not expired (fails if it was changed)
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // find that user in the database
    const user = await User.findById(decoded.id).select("-password");
    if (!user) return res.status(401).json({ message: "Please login." });

    req.user = user; // the next step can now use req.user
    next();          // let the request continue
  } catch (error) {
    return res.status(401).json({ message: "Please login." });
  }
}

// adminOnly: the user must be an admin (always used AFTER protect)
function adminOnly(req, res, next) {
  if (req.user && req.user.role === "admin") {
    return next();
  }
  return res.status(403).json({ message: "Access denied." });
}

module.exports = { protect, adminOnly };