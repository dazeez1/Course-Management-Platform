const { DataTypes } = require("sequelize");
const bcrypt = require("bcryptjs");
const { databaseConnection } = require("../config/database");

const User = databaseConnection.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    firstName: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [2, 50],
      },
    },
    lastName: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [2, 50],
      },
    },
    emailAddress: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
        notEmpty: true,
      },
    },
    passwordHash: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    userRole: {
      type: DataTypes.ENUM("manager", "facilitator", "student"),
      allowNull: false,
      defaultValue: "student",
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    lastLoginAt: {
      type: DataTypes.DATE,
    },
  },
  {
    tableName: "users",
    hooks: {
      beforeCreate: async (user) => {
        if (user.passwordHash) {
          const saltRounds = 12;
          user.passwordHash = await bcrypt.hash(user.passwordHash, saltRounds);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed("passwordHash")) {
          const saltRounds = 12;
          user.passwordHash = await bcrypt.hash(user.passwordHash, saltRounds);
        }
      },
    },
  }
);

// Instance method to check password
User.prototype.verifyPassword = async function (password) {
  return await bcrypt.compare(password, this.passwordHash);
};

// Instance method to get full name
User.prototype.getFullName = function () {
  return `${this.firstName} ${this.lastName}`;
};

module.exports = User;
