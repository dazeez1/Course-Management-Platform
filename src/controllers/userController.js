const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");
const { User } = require("../models");
const { Op } = require("sequelize");

const getAllUsers = async (request, response) => {
  try {
    const { page = 1, limit = 10, role, search } = request.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (role) {
      whereClause.userRole = role;
    }
    if (search) {
      whereClause[Op.or] = [
        { firstName: { [Op.like]: `%${search}%` } },
        { lastName: { [Op.like]: `%${search}%` } },
        { emailAddress: { [Op.like]: `%${search}%` } },
      ];
    }

    const { count, rows: users } = await User.findAndCountAll({
      where: whereClause,
      attributes: { exclude: ["passwordHash"] },
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["createdAt", "DESC"]],
    });

    const totalPages = Math.ceil(count / limit);

    response.status(200).json({
      success: true,
      data: {
        users: users.map((user) => ({
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          emailAddress: user.emailAddress,
          userRole: user.userRole,
          fullName: user.getFullName(),
          isActive: user.isActive,
          lastLoginAt: user.lastLoginAt,
          createdAt: user.createdAt,
        })),
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalUsers: count,
          usersPerPage: parseInt(limit),
        },
      },
    });
  } catch (error) {
    console.error("Get all users error:", error);
    response.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const getUserById = async (request, response) => {
  try {
    const { userId } = request.params;

    const user = await User.findByPk(userId, {
      attributes: { exclude: ["passwordHash"] },
    });

    if (!user) {
      return response.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    response.status(200).json({
      success: true,
      data: {
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          emailAddress: user.emailAddress,
          userRole: user.userRole,
          fullName: user.getFullName(),
          isActive: user.isActive,
          lastLoginAt: user.lastLoginAt,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      },
    });
  } catch (error) {
    console.error("Get user by ID error:", error);
    response.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const updateUserProfile = async (request, response) => {
  try {
    const validationErrors = validationResult(request);
    if (!validationErrors.isEmpty()) {
      return response.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationErrors.array(),
      });
    }

    const { firstName, lastName, emailAddress } = request.body;
    const userId = request.user.userId;

    const user = await User.findByPk(userId);
    if (!user) {
      return response.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (emailAddress && emailAddress !== user.emailAddress) {
      const existingUser = await User.findOne({ where: { emailAddress } });
      if (existingUser) {
        return response.status(409).json({
          success: false,
          message: "Email address already in use",
        });
      }
    }

    const updateData = {};
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (emailAddress) updateData.emailAddress = emailAddress;

    await user.update(updateData);

    response.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: {
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          emailAddress: user.emailAddress,
          userRole: user.userRole,
          fullName: user.getFullName(),
          isActive: user.isActive,
          lastLoginAt: user.lastLoginAt,
          updatedAt: user.updatedAt,
        },
      },
    });
  } catch (error) {
    console.error("Update profile error:", error);
    response.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const changeUserPassword = async (request, response) => {
  try {
    const validationErrors = validationResult(request);
    if (!validationErrors.isEmpty()) {
      return response.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationErrors.array(),
      });
    }

    const { currentPassword, newPassword } = request.body;
    const userId = request.user.userId;

    const user = await User.findByPk(userId);
    if (!user) {
      return response.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const isCurrentPasswordValid = await user.verifyPassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return response.status(400).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 12);
    await user.update({ passwordHash: newPasswordHash });

    response.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Change password error:", error);
    response.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const deactivateUser = async (request, response) => {
  try {
    const { userId } = request.params;
    const currentUserId = request.user.userId;

    if (parseInt(userId) === currentUserId) {
      return response.status(400).json({
        success: false,
        message: "Cannot deactivate your own account",
      });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return response.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    await user.update({ isActive: false });

    response.status(200).json({
      success: true,
      message: "User deactivated successfully",
    });
  } catch (error) {
    console.error("Deactivate user error:", error);
    response.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const activateUser = async (request, response) => {
  try {
    const { userId } = request.params;

    const user = await User.findByPk(userId);
    if (!user) {
      return response.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    await user.update({ isActive: true });

    response.status(200).json({
      success: true,
      message: "User activated successfully",
    });
  } catch (error) {
    console.error("Activate user error:", error);
    response.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUserProfile,
  changeUserPassword,
  deactivateUser,
  activateUser,
};
