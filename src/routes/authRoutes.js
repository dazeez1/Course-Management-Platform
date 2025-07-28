const express = require("express");
const {
  registerUser,
  loginUser,
  getCurrentUser,
} = require("../controllers/authController");
const {
  registerValidation,
  loginValidation,
} = require("../middleware/validation");
const { authenticateToken } = require("../middleware/authentication");

const router = express.Router();

router.post("/register", registerValidation, registerUser);
router.post("/login", loginValidation, loginUser);
router.get("/me", authenticateToken, getCurrentUser);

module.exports = router;
