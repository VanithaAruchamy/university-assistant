// middleware/auth.js
const jwt = require("jsonwebtoken");
const logger = require("../utils/logger");

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      error: "Access denied. No token provided.",
      code: "NO_TOKEN",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    logger.warn(`Invalid token attempt: ${err.message}`);
    return res.status(403).json({
      success: false,
      error: "Invalid or expired token.",
      code: "INVALID_TOKEN",
    });
  }
}

module.exports = { authenticateToken };
