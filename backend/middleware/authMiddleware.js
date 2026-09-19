const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * Protects a route: requires a valid JWT in the Authorization header.
 * Header format:  Authorization: Bearer <token>
 *
 * On success, attaches the logged-in user to req.user and calls next().
 * On failure, responds with 401 and does NOT call next().
 */
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Attach user (without password field) to the request object
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        return res.status(401).json({ error: "User no longer exists" });
      }

      return next();
    } catch (err) {
      return res.status(401).json({ error: "Not authorized, invalid or expired token" });
    }
  }

  return res.status(401).json({ error: "Not authorized, no token provided" });
};

module.exports = { protect };
