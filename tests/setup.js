// Jest setup file
require("dotenv").config();

// Set test environment variables
process.env.NODE_ENV = "test";
process.env.DB_NAME = "course_management_test";
process.env.JWT_SECRET = "test-secret-key";

// Global test timeout
jest.setTimeout(30000);

// Suppress console logs during tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};
