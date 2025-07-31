const { User } = require("../src/models");
const bcrypt = require("bcryptjs");

describe("User Model", () => {
  beforeAll(async () => {
    // Setup test database connection
    const { sequelize } = require("../src/config/database");
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    const { sequelize } = require("../src/config/database");
    await sequelize.close();
  });

  beforeEach(async () => {
    await User.destroy({ where: {} });
  });

  describe("User Creation", () => {
    test("should create a user with valid data", async () => {
      const userData = {
        firstName: "John",
        lastName: "Doe",
        emailAddress: "john.doe@example.com",
        passwordHash: await bcrypt.hash("password123", 12),
        userRole: "facilitator",
        isActive: true,
      };

      const user = await User.create(userData);

      expect(user).toBeDefined();
      expect(user.firstName).toBe("John");
      expect(user.lastName).toBe("Doe");
      expect(user.emailAddress).toBe("john.doe@example.com");
      expect(user.userRole).toBe("facilitator");
      expect(user.isActive).toBe(true);
    });

    test("should require firstName", async () => {
      const userData = {
        lastName: "Doe",
        emailAddress: "john.doe@example.com",
        passwordHash: await bcrypt.hash("password123", 12),
        userRole: "facilitator",
      };

      await expect(User.create(userData)).rejects.toThrow();
    });

    test("should require emailAddress", async () => {
      const userData = {
        firstName: "John",
        lastName: "Doe",
        passwordHash: await bcrypt.hash("password123", 12),
        userRole: "facilitator",
      };

      await expect(User.create(userData)).rejects.toThrow();
    });
  });

  describe("User Instance Methods", () => {
    test("should return full name", async () => {
      const user = await User.create({
        firstName: "John",
        lastName: "Doe",
        emailAddress: "john.doe@example.com",
        passwordHash: await bcrypt.hash("password123", 12),
        userRole: "facilitator",
      });

      expect(user.getFullName()).toBe("John Doe");
    });

    test("should verify password correctly", async () => {
      const password = "password123";
      const user = await User.create({
        firstName: "John",
        lastName: "Doe",
        emailAddress: "john.doe@example.com",
        passwordHash: await bcrypt.hash(password, 12),
        userRole: "facilitator",
      });

      expect(await user.verifyPassword(password)).toBe(true);
      expect(await user.verifyPassword("wrongpassword")).toBe(false);
    });
  });

  describe("User Validation", () => {
    test("should validate email format", async () => {
      const userData = {
        firstName: "John",
        lastName: "Doe",
        emailAddress: "invalid-email",
        passwordHash: await bcrypt.hash("password123", 12),
        userRole: "facilitator",
      };

      await expect(User.create(userData)).rejects.toThrow();
    });

    test("should validate userRole enum", async () => {
      const userData = {
        firstName: "John",
        lastName: "Doe",
        emailAddress: "john.doe@example.com",
        passwordHash: await bcrypt.hash("password123", 12),
        userRole: "invalid-role",
      };

      await expect(User.create(userData)).rejects.toThrow();
    });
  });
});
