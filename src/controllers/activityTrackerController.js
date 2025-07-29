const {
  ActivityTracker,
  CourseAllocation,
  User,
  Course,
  Cohort,
} = require("../models");
const { validationResult } = require("express-validator");
const { Op } = require("sequelize");
const redisClient = require("../config/redis");

// Create a new activity log (Facilitator only - for their own allocations)
const createActivityLog = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const {
      allocationId,
      weekNumber,
      academicYear,
      attendanceStatus,
      formativeOneGrading,
      formativeTwoGrading,
      summativeGrading,
      courseModeration,
      intranetSync,
      gradeBookStatus,
      additionalNotes,
    } = req.body;

    // Verify the allocation belongs to the current facilitator
    const allocation = await CourseAllocation.findByPk(allocationId);
    if (!allocation) {
      return res
        .status(404)
        .json({ success: false, message: "Course allocation not found" });
    }

    if (allocation.facilitatorId !== req.currentUser.id) {
      return res.status(403).json({
        success: false,
        message:
          "Access denied - you can only create logs for your own allocations",
      });
    }

    const activityLog = await ActivityTracker.create({
      allocationId,
      facilitatorId: req.currentUser.id,
      weekNumber,
      academicYear,
      attendanceStatus,
      formativeOneGrading,
      formativeTwoGrading,
      summativeGrading,
      courseModeration,
      intranetSync,
      gradeBookStatus,
      additionalNotes,
      submittedAt: new Date(),
    });

    // Queue notification for managers
    await queueManagerNotification(activityLog, "submitted");

    res.status(201).json({ success: true, data: activityLog });
  } catch (error) {
    console.error("Create activity log error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// List activity logs (Facilitator: own, Manager: all)
const listActivityLogs = async (req, res) => {
  try {
    const {
      allocationId,
      facilitatorId,
      weekNumber,
      academicYear,
      gradingStatus,
      page = 1,
      limit = 10,
    } = req.query;

    const where = {};
    if (allocationId) where.allocationId = allocationId;
    if (weekNumber) where.weekNumber = weekNumber;
    if (academicYear) where.academicYear = academicYear;

    // Facilitators can only see their own logs
    if (req.currentUser.userRole === "facilitator") {
      where.facilitatorId = req.currentUser.id;
    } else if (facilitatorId) {
      where.facilitatorId = facilitatorId;
    }

    // Filter by grading status if provided
    if (gradingStatus) {
      where[Op.or] = [
        { formativeOneGrading: gradingStatus },
        { formativeTwoGrading: gradingStatus },
        { summativeGrading: gradingStatus },
        { courseModeration: gradingStatus },
        { intranetSync: gradingStatus },
        { gradeBookStatus: gradingStatus },
      ];
    }

    const offset = (page - 1) * limit;

    const { count, rows: logs } = await ActivityTracker.findAndCountAll({
      where,
      include: [
        {
          model: CourseAllocation,
          as: "courseAllocation",
          include: [
            {
              model: Course,
              as: "course",
              attributes: ["id", "courseCode", "courseTitle"],
            },
            { model: Cohort, as: "cohort", attributes: ["id", "cohortName"] },
          ],
        },
        {
          model: User,
          as: "facilitator",
          attributes: ["id", "firstName", "lastName", "emailAddress"],
        },
      ],
      order: [["createdAt", "DESC"]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.status(200).json({
      success: true,
      data: logs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.error("List activity logs error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Get activity log by ID (Facilitator: own, Manager: any)
const getActivityLog = async (req, res) => {
  try {
    const { id } = req.params;

    const log = await ActivityTracker.findByPk(id, {
      include: [
        {
          model: CourseAllocation,
          as: "courseAllocation",
          include: [
            {
              model: Course,
              as: "course",
              attributes: ["id", "courseCode", "courseTitle"],
            },
            { model: Cohort, as: "cohort", attributes: ["id", "cohortName"] },
          ],
        },
        {
          model: User,
          as: "facilitator",
          attributes: ["id", "firstName", "lastName", "emailAddress"],
        },
      ],
    });

    if (!log) {
      return res
        .status(404)
        .json({ success: false, message: "Activity log not found" });
    }

    // Check access control
    if (
      req.currentUser.userRole === "facilitator" &&
      log.facilitatorId !== req.currentUser.id
    ) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    res.status(200).json({ success: true, data: log });
  } catch (error) {
    console.error("Get activity log error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Update activity log (Facilitator: own only)
const updateActivityLog = async (req, res) => {
  try {
    const { id } = req.params;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const log = await ActivityTracker.findByPk(id);
    if (!log) {
      return res
        .status(404)
        .json({ success: false, message: "Activity log not found" });
    }

    // Only facilitators can update their own logs
    if (log.facilitatorId !== req.currentUser.id) {
      return res.status(403).json({
        success: false,
        message: "Access denied - you can only update your own logs",
      });
    }

    await log.update({
      ...req.body,
      lastUpdatedAt: new Date(),
    });

    // Queue notification for managers
    await queueManagerNotification(log, "updated");

    res.status(200).json({ success: true, data: log });
  } catch (error) {
    console.error("Update activity log error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Delete activity log (Facilitator: own only)
const deleteActivityLog = async (req, res) => {
  try {
    const { id } = req.params;

    const log = await ActivityTracker.findByPk(id);
    if (!log) {
      return res
        .status(404)
        .json({ success: false, message: "Activity log not found" });
    }

    // Only facilitators can delete their own logs
    if (log.facilitatorId !== req.currentUser.id) {
      return res.status(403).json({
        success: false,
        message: "Access denied - you can only delete your own logs",
      });
    }

    await log.destroy();

    // Queue notification for managers
    await queueManagerNotification(log, "deleted");

    res.status(200).json({ success: true, message: "Activity log deleted" });
  } catch (error) {
    console.error("Delete activity log error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Get activity log statistics (Manager only)
const getActivityStats = async (req, res) => {
  try {
    if (req.currentUser.userRole !== "manager") {
      return res
        .status(403)
        .json({ success: false, message: "Access denied - managers only" });
    }

    const { academicYear, facilitatorId } = req.query;
    const where = {};
    if (academicYear) where.academicYear = academicYear;
    if (facilitatorId) where.facilitatorId = facilitatorId;

    const stats = await ActivityTracker.findAll({
      where,
      attributes: [
        "formativeOneGrading",
        "formativeTwoGrading",
        "summativeGrading",
        "courseModeration",
        "intranetSync",
        "gradeBookStatus",
      ],
    });

    const statusCounts = {
      Done: 0,
      Pending: 0,
      "Not Started": 0,
    };

    stats.forEach((log) => {
      Object.values(log.dataValues).forEach((status) => {
        if (statusCounts.hasOwnProperty(status)) {
          statusCounts[status]++;
        }
      });
    });

    const totalActivities = stats.length * 6; // 6 status fields per log
    const completionRate =
      totalActivities > 0
        ? ((statusCounts["Done"] / totalActivities) * 100).toFixed(2)
        : 0;

    res.status(200).json({
      success: true,
      data: {
        totalLogs: stats.length,
        totalActivities,
        statusCounts,
        completionRate: `${completionRate}%`,
      },
    });
  } catch (error) {
    console.error("Get activity stats error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Helper function to queue manager notifications
const queueManagerNotification = async (activityLog, action) => {
  try {
    const notification = {
      type: "activity_log",
      action,
      logId: activityLog.id,
      facilitatorId: activityLog.facilitatorId,
      weekNumber: activityLog.weekNumber,
      academicYear: activityLog.academicYear,
      timestamp: new Date().toISOString(),
    };

    await redisClient.lpush(
      "manager_notifications",
      JSON.stringify(notification)
    );
    console.log(
      `Queued ${action} notification for activity log ${activityLog.id}`
    );
  } catch (error) {
    console.error("Error queuing notification:", error);
  }
};

module.exports = {
  createActivityLog,
  listActivityLogs,
  getActivityLog,
  updateActivityLog,
  deleteActivityLog,
  getActivityStats,
};
