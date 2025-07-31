const bcrypt = require("bcryptjs");

// Utility functions for testing
const generatePasswordHash = async (password) => {
  return await bcrypt.hash(password, 12);
};

const verifyPassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return (
    emailRegex.test(email) &&
    !email.includes("..") &&
    email.indexOf("@") > 0 &&
    email.lastIndexOf(".") > email.indexOf("@")
  );
};

const validateWeekNumber = (weekNumber) => {
  return Number.isInteger(weekNumber) && weekNumber >= 1 && weekNumber <= 52;
};

const validateAttendanceArray = (attendanceArray) => {
  return (
    Array.isArray(attendanceArray) &&
    attendanceArray.length === 5 &&
    attendanceArray.every((status) => typeof status === "boolean")
  );
};

describe("Utility Functions", () => {
  describe("Password Utilities", () => {
    test("should generate password hash", async () => {
      const password = "testPassword123";
      const hash = await generatePasswordHash(password);

      expect(hash).toBeDefined();
      expect(typeof hash).toBe("string");
      expect(hash.length).toBeGreaterThan(0);
    });

    test("should verify correct password", async () => {
      const password = "testPassword123";
      const hash = await generatePasswordHash(password);

      const isValid = await verifyPassword(password, hash);
      expect(isValid).toBe(true);
    });

    test("should reject incorrect password", async () => {
      const password = "testPassword123";
      const wrongPassword = "wrongPassword123";
      const hash = await generatePasswordHash(password);

      const isValid = await verifyPassword(wrongPassword, hash);
      expect(isValid).toBe(false);
    });
  });

  describe("Email Validation", () => {
    test("should validate correct email formats", () => {
      const validEmails = [
        "test@example.com",
        "user.name@domain.co.uk",
        "user+tag@example.org",
        "123@numbers.com",
      ];

      validEmails.forEach((email) => {
        expect(validateEmail(email)).toBe(true);
      });
    });

    test("should reject invalid email formats", () => {
      const invalidEmails = [
        "invalid-email",
        "@example.com",
        "user@",
        "user@.com",
        "user..name@example.com",
      ];

      invalidEmails.forEach((email) => {
        expect(validateEmail(email)).toBe(false);
      });
    });
  });

  describe("Week Number Validation", () => {
    test("should validate correct week numbers", () => {
      const validWeeks = [1, 26, 52];

      validWeeks.forEach((week) => {
        expect(validateWeekNumber(week)).toBe(true);
      });
    });

    test("should reject invalid week numbers", () => {
      const invalidWeeks = [0, 53, -1, 1.5, "1"];

      invalidWeeks.forEach((week) => {
        expect(validateWeekNumber(week)).toBe(false);
      });
    });
  });

  describe("Attendance Array Validation", () => {
    test("should validate correct attendance arrays", () => {
      const validArrays = [
        [true, true, true, true, true],
        [false, false, false, false, false],
        [true, false, true, false, true],
      ];

      validArrays.forEach((array) => {
        expect(validateAttendanceArray(array)).toBe(true);
      });
    });

    test("should reject invalid attendance arrays", () => {
      const invalidArrays = [
        [true, true, true, true], // Too short
        [true, true, true, true, true, true], // Too long
        [true, true, true, true, "true"], // Wrong type
        "not-an-array",
        null,
        undefined,
      ];

      invalidArrays.forEach((array) => {
        expect(validateAttendanceArray(array)).toBe(false);
      });
    });
  });
});
