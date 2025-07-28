const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const { User } = require("../models");

const generateToken = (user) => {
  return jwt.sign(
    {
      userId: user.id,
      emailAddress: user.emailAddress,
      userRole: user.userRole,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

const registerUser = async (request, response) => {
  try {
    const validationErrors = validationResult(request);
    if (!validationErrors.isEmpty()) {
      return response.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationErrors.array(),
      });
    }

    const { firstName, lastName, emailAddress, password, userRole } =
      request.body;

    const existingUser = await User.findOne({ where: { emailAddress } });
    if (existingUser) {
      return response.status(409).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    const newUser = await User.create({
      firstName,
      lastName,
      emailAddress,
      passwordHash: password,
      userRole: userRole || "student",
    });

    const token = generateToken(newUser);

    response.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        user: {
          id: newUser.id,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          emailAddress: newUser.emailAddress,
          userRole: newUser.userRole,
          fullName: newUser.getFullName(),
        },
        token,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    response.status(500).json({
      success: false,
      message: "Internal server error during registration",
    });
  }
};

const loginUser = async (request, response) => {
  try {
    const validationErrors = validationResult(request);
    if (!validationErrors.isEmpty()) {
      return response.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationErrors.array(),
      });
    }

    const { emailAddress, password } = request.body;

    const user = await User.findOne({ where: { emailAddress } });
    if (!user) {
      return response.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (!user.isActive) {
      return response.status(401).json({
        success: false,
        message: "Account is deactivated",
      });
    }

    const isPasswordValid = await user.verifyPassword(password);
    if (!isPasswordValid) {
      return response.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    await user.update({ lastLoginAt: new Date() });

    const token = generateToken(user);

    response.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          emailAddress: user.emailAddress,
          userRole: user.userRole,
          fullName: user.getFullName(),
          lastLoginAt: user.lastLoginAt,
        },
        token,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    response.status(500).json({
      success: false,
      message: "Internal server error during login",
    });
  }
};

const getCurrentUser = async (request, response) => {
  try {
    const user = request.currentUser;

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
        },
      },
    });
  } catch (error) {
    console.error("Get current user error:", error);
    response.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getCurrentUser,
};
