const express = require("express");
const {
  authenticateToken,
  requireRole,
} = require("../middleware/authentication");
const {
  allocationValidation,
  allocationUpdateValidation,
} = require("../middleware/validation");
const allocationController = require("../controllers/courseAllocationController");

const router = express.Router();

// Course Allocation CRUD
router.post(
  "/allocations",
  authenticateToken,
  requireRole(["manager"]),
  allocationValidation,
  allocationController.createAllocation
);
router.get(
  "/allocations",
  authenticateToken,
  allocationController.listAllocations
);
router.get(
  "/allocations/:id",
  authenticateToken,
  allocationController.getAllocation
);
router.put(
  "/allocations/:id",
  authenticateToken,
  requireRole(["manager"]),
  allocationUpdateValidation,
  allocationController.updateAllocation
);
router.delete(
  "/allocations/:id",
  authenticateToken,
  requireRole(["manager"]),
  allocationController.deleteAllocation
);

module.exports = router;
