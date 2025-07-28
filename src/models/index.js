const User = require("./User");
const Course = require("./Course");
const Cohort = require("./Cohort");
const CourseAllocation = require("./CourseAllocation");
const ActivityTracker = require("./ActivityTracker");

// User relationships
User.hasMany(CourseAllocation, {
  foreignKey: "facilitatorId",
  as: "facilitatorAllocations",
});

User.hasMany(CourseAllocation, {
  foreignKey: "assignedBy",
  as: "managerAssignments",
});

User.hasMany(ActivityTracker, {
  foreignKey: "facilitatorId",
  as: "activityLogs",
});

// Course relationships
Course.hasMany(CourseAllocation, {
  foreignKey: "courseId",
  as: "courseAllocations",
});

// Cohort relationships
Cohort.hasMany(CourseAllocation, {
  foreignKey: "cohortId",
  as: "cohortAllocations",
});

// CourseAllocation relationships
CourseAllocation.belongsTo(User, {
  foreignKey: "facilitatorId",
  as: "facilitator",
});

CourseAllocation.belongsTo(User, {
  foreignKey: "assignedBy",
  as: "assignedByManager",
});

CourseAllocation.belongsTo(Course, {
  foreignKey: "courseId",
  as: "course",
});

CourseAllocation.belongsTo(Cohort, {
  foreignKey: "cohortId",
  as: "cohort",
});

CourseAllocation.hasMany(ActivityTracker, {
  foreignKey: "allocationId",
  as: "activityLogs",
});

// ActivityTracker relationships
ActivityTracker.belongsTo(CourseAllocation, {
  foreignKey: "allocationId",
  as: "courseAllocation",
});

ActivityTracker.belongsTo(User, {
  foreignKey: "facilitatorId",
  as: "facilitator",
});

module.exports = {
  User,
  Course,
  Cohort,
  CourseAllocation,
  ActivityTracker,
};
