const { CourseAllocation, User, Course, Cohort } = require("../models");
const { validationResult } = require("express-validator");
const { Op } = require("sequelize");

// Create a new course allocation (Manager only)
const createAllocation = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    const {
      courseId,
      facilitatorId,
      cohortId,
      trimester,
      intakePeriod,
      deliveryMode,
      classSection,
      isActive,
    } = req.body;
    const allocation = await CourseAllocation.create({
      courseId,
      facilitatorId,
      cohortId,
      trimester,
      intakePeriod,
      deliveryMode,
      classSection,
      isActive: isActive !== undefined ? isActive : true,
      assignedBy: req.currentUser.id,
    });
    res.status(201).json({ success: true, data: allocation });
  } catch (error) {
    console.error("Create allocation error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// List allocations (Manager: all, Facilitator: own)
const listAllocations = async (req, res) => {
  try {
    const {
      trimester,
      cohortId,
      facilitatorId,
      intakePeriod,
      deliveryMode,
      classSection,
      courseId,
    } = req.query;
    const where = {};
    if (trimester) where.trimester = trimester;
    if (cohortId) where.cohortId = cohortId;
    if (facilitatorId) where.facilitatorId = facilitatorId;
    if (intakePeriod) where.intakePeriod = intakePeriod;
    if (deliveryMode) where.deliveryMode = deliveryMode;
    if (classSection) where.classSection = classSection;
    if (courseId) where.courseId = courseId;
    if (req.currentUser.userRole === "facilitator") {
      where.facilitatorId = req.currentUser.id;
    }
    const allocations = await CourseAllocation.findAll({
      where,
      include: [
        {
          model: User,
          as: "facilitator",
          attributes: ["id", "firstName", "lastName", "emailAddress"],
        },
        {
          model: Course,
          as: "course",
          attributes: ["id", "courseCode", "courseTitle"],
        },
        { model: Cohort, as: "cohort", attributes: ["id", "cohortName"] },
      ],
      order: [["createdAt", "DESC"]],
    });
    res.status(200).json({ success: true, data: allocations });
  } catch (error) {
    console.error("List allocations error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Get allocation by ID (Manager: any, Facilitator: own)
const getAllocation = async (req, res) => {
  try {
    const { id } = req.params;
    const allocation = await CourseAllocation.findByPk(id, {
      include: [
        {
          model: User,
          as: "facilitator",
          attributes: ["id", "firstName", "lastName", "emailAddress"],
        },
        {
          model: Course,
          as: "course",
          attributes: ["id", "courseCode", "courseTitle"],
        },
        { model: Cohort, as: "cohort", attributes: ["id", "cohortName"] },
      ],
    });
    if (!allocation) {
      return res
        .status(404)
        .json({ success: false, message: "Allocation not found" });
    }
    if (
      req.currentUser.userRole === "facilitator" &&
      allocation.facilitatorId !== req.currentUser.id
    ) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }
    res.status(200).json({ success: true, data: allocation });
  } catch (error) {
    console.error("Get allocation error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Update allocation (Manager only)
const updateAllocation = async (req, res) => {
  try {
    const { id } = req.params;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    const allocation = await CourseAllocation.findByPk(id);
    if (!allocation) {
      return res
        .status(404)
        .json({ success: false, message: "Allocation not found" });
    }
    await allocation.update(req.body);
    res.status(200).json({ success: true, data: allocation });
  } catch (error) {
    console.error("Update allocation error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Delete allocation (Manager only)
const deleteAllocation = async (req, res) => {
  try {
    const { id } = req.params;
    const allocation = await CourseAllocation.findByPk(id);
    if (!allocation) {
      return res
        .status(404)
        .json({ success: false, message: "Allocation not found" });
    }
    await allocation.destroy();
    res.status(200).json({ success: true, message: "Allocation deleted" });
  } catch (error) {
    console.error("Delete allocation error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

module.exports = {
  createAllocation,
  listAllocations,
  getAllocation,
  updateAllocation,
  deleteAllocation,
};
