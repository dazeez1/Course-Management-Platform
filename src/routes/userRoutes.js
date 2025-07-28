const express = require("express");
const {
  getAllUsers,
  getUserById,
  updateUserProfile,
  changeUserPassword,
  deactivateUser,
  activateUser,
} = require("../controllers/userController");
const {
  updateProfileValidation,
  changePasswordValidation,
} = require("../middleware/validation");
const {
  authenticateToken,
  requireRole,
} = require("../middleware/authentication");

const router = express.Router();

router.get("/", authenticateToken, requireRole(["manager"]), getAllUsers);
router.get(
  "/:userId",
  authenticateToken,
  requireRole(["manager"]),
  getUserById
);
router.put(
  "/profile",
  authenticateToken,
  updateProfileValidation,
  updateUserProfile
);
router.put(
  "/password",
  authenticateToken,
  changePasswordValidation,
  changeUserPassword
);
router.put(
  "/:userId/deactivate",
  authenticateToken,
  requireRole(["manager"]),
  deactivateUser
);
router.put(
  "/:userId/activate",
  authenticateToken,
  requireRole(["manager"]),
  activateUser
);

module.exports = router;
