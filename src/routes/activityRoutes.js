const express = require("express");
const {
  authenticateToken,
  requireRole,
} = require("../middleware/authentication");
const {
  activityLogValidation,
  activityLogUpdateValidation,
} = require("../middleware/validation");
const activityController = require("../controllers/activityTrackerController");

const router = express.Router();

// Activity Tracker CRUD - Facilitators can manage their own logs, Managers can read all
router.post(
  "/logs",
  authenticateToken,
  requireRole(["facilitator"]),
  activityLogValidation,
  activityController.createActivityLog
);
router.get(
  "/logs",
  authenticateToken,
  requireRole(["facilitator", "manager"]),
  activityController.listActivityLogs
);
router.get(
  "/logs/:id",
  authenticateToken,
  requireRole(["facilitator", "manager"]),
  activityController.getActivityLog
);
router.put(
  "/logs/:id",
  authenticateToken,
  requireRole(["facilitator"]),
  activityLogUpdateValidation,
  activityController.updateActivityLog
);
router.delete(
  "/logs/:id",
  authenticateToken,
  requireRole(["facilitator"]),
  activityController.deleteActivityLog
);

// Activity Statistics - Managers only
router.get(
  "/stats",
  authenticateToken,
  requireRole(["manager"]),
  activityController.getActivityStats
);

module.exports = router;
