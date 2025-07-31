const jwt = require("jsonwebtoken");
const { User } = require("../models");

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        error: "Access token required",
        message: "Please provide a valid authentication token",
      });
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    const currentUser = await User.findByPk(decodedToken.userId, {
      attributes: { exclude: ["passwordHash"] },
    });

    if (!currentUser || !currentUser.isActive) {
      return res.status(401).json({
        error: "Invalid token",
        message: "User not found or account is inactive",
      });
    }

    req.currentUser = currentUser;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        error: "Invalid token",
        message: "The provided token is invalid",
      });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        error: "Token expired",
        message: "Your session has expired. Please login again",
      });
    }

    console.error("Authentication error:", error);
    return res.status(500).json({
      error: "Authentication failed",
      message: "An error occurred during authentication",
    });
  }
};

const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.currentUser) {
      return res.status(401).json({
        error: "Authentication required",
        message: "Please login to access this resource",
      });
    }

    if (!allowedRoles.includes(req.currentUser.userRole)) {
      return res.status(403).json({
        error: "Access denied",
        message: "You do not have permission to access this resource",
      });
    }

    next();
  };
};

module.exports = {
  authenticateToken,
  requireRole,
};
