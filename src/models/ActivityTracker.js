const { DataTypes } = require("sequelize");
const { databaseConnection } = require("../config/database");

const ActivityTracker = databaseConnection.define(
  "ActivityTracker",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    allocationId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "course_allocations",
        key: "id",
      },
    },
    facilitatorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    weekNumber: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 52,
      },
    },
    academicYear: {
      type: DataTypes.STRING(9),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [9, 9],
      },
    },
    attendanceStatus: {
      type: DataTypes.JSON,
      allowNull: false,
      comment: "Array of boolean values for each day of the week",
    },
    formativeOneGrading: {
      type: DataTypes.ENUM("Done", "Pending", "Not Started"),
      allowNull: false,
      defaultValue: "Not Started",
    },
    formativeTwoGrading: {
      type: DataTypes.ENUM("Done", "Pending", "Not Started"),
      allowNull: false,
      defaultValue: "Not Started",
    },
    summativeGrading: {
      type: DataTypes.ENUM("Done", "Pending", "Not Started"),
      allowNull: false,
      defaultValue: "Not Started",
    },
    courseModeration: {
      type: DataTypes.ENUM("Done", "Pending", "Not Started"),
      allowNull: false,
      defaultValue: "Not Started",
    },
    intranetSync: {
      type: DataTypes.ENUM("Done", "Pending", "Not Started"),
      allowNull: false,
      defaultValue: "Not Started",
    },
    gradeBookStatus: {
      type: DataTypes.ENUM("Done", "Pending", "Not Started"),
      allowNull: false,
      defaultValue: "Not Started",
    },
    additionalNotes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    submittedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    lastUpdatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "activity_trackers",
    hooks: {
      beforeUpdate: (activity) => {
        activity.lastUpdatedAt = new Date();
      },
    },
  }
);

// Instance method to check if all activities are completed
ActivityTracker.prototype.isAllActivitiesCompleted = function () {
  const activities = [
    this.formativeOneGrading,
    this.formativeTwoGrading,
    this.summativeGrading,
    this.courseModeration,
    this.intranetSync,
    this.gradeBookStatus,
  ];

  return activities.every((activity) => activity === "Done");
};

// Instance method to get completion percentage
ActivityTracker.prototype.getCompletionPercentage = function () {
  const activities = [
    this.formativeOneGrading,
    this.formativeTwoGrading,
    this.summativeGrading,
    this.courseModeration,
    this.intranetSync,
    this.gradeBookStatus,
  ];

  const completedCount = activities.filter(
    (activity) => activity === "Done"
  ).length;
  return Math.round((completedCount / activities.length) * 100);
};

module.exports = ActivityTracker;
