const { DataTypes } = require("sequelize");
const { databaseConnection } = require("../config/database");

const CourseAllocation = databaseConnection.define(
  "CourseAllocation",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    courseId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "courses",
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
    cohortId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "cohorts",
        key: "id",
      },
    },
    trimester: {
      type: DataTypes.ENUM("HT1", "HT2", "FT"),
      allowNull: false,
    },
    intakePeriod: {
      type: DataTypes.STRING(20),
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    deliveryMode: {
      type: DataTypes.ENUM("online", "in-person", "hybrid"),
      allowNull: false,
      defaultValue: "in-person",
    },
    classSection: {
      type: DataTypes.STRING(20),
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    assignedBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
  },
  {
    tableName: "course_allocations",
  }
);

module.exports = CourseAllocation;
