const { CourseAllocation, User, Course, Cohort } = require("../src/models");

describe("CourseAllocation Model", () => {
  beforeAll(async () => {
    const { sequelize } = require("../src/config/database");
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    const { sequelize } = require("../src/config/database");
    await sequelize.close();
  });

  beforeEach(async () => {
    await CourseAllocation.destroy({ where: {} });
    await User.destroy({ where: {} });
    await Course.destroy({ where: {} });
    await Cohort.destroy({ where: {} });
  });

  describe("CourseAllocation Creation", () => {
    test("should create a course allocation with valid data", async () => {
      const facilitator = await User.create({
        firstName: "John",
        lastName: "Doe",
        emailAddress: "john.doe@example.com",
        passwordHash: "hash",
        userRole: "facilitator",
      });

      const course = await Course.create({
        courseCode: "CS101",
        courseTitle: "Introduction to Computer Science",
        credits: 3,
      });

      const cohort = await Cohort.create({
        cohortName: "2024S",
        startDate: new Date(),
        endDate: new Date(),
      });

      const allocationData = {
        facilitatorId: facilitator.id,
        courseId: course.id,
        cohortId: cohort.id,
        trimester: "HT1",
        intakePeriod: "2024S",
        deliveryMode: "online",
        isActive: true,
      };

      const allocation = await CourseAllocation.create(allocationData);

      expect(allocation).toBeDefined();
      expect(allocation.facilitatorId).toBe(facilitator.id);
      expect(allocation.courseId).toBe(course.id);
      expect(allocation.cohortId).toBe(cohort.id);
      expect(allocation.trimester).toBe("HT1");
      expect(allocation.intakePeriod).toBe("2024S");
      expect(allocation.deliveryMode).toBe("online");
      expect(allocation.isActive).toBe(true);
    });

    test("should require facilitatorId", async () => {
      const allocationData = {
        courseId: 1,
        cohortId: 1,
        trimester: "HT1",
        intakePeriod: "2024S",
        deliveryMode: "online",
      };

      await expect(CourseAllocation.create(allocationData)).rejects.toThrow();
    });

    test("should require courseId", async () => {
      const allocationData = {
        facilitatorId: 1,
        cohortId: 1,
        trimester: "HT1",
        intakePeriod: "2024S",
        deliveryMode: "online",
      };

      await expect(CourseAllocation.create(allocationData)).rejects.toThrow();
    });
  });

  describe("CourseAllocation Validation", () => {
    test("should validate trimester enum", async () => {
      const allocationData = {
        facilitatorId: 1,
        courseId: 1,
        cohortId: 1,
        trimester: "INVALID",
        intakePeriod: "2024S",
        deliveryMode: "online",
      };

      await expect(CourseAllocation.create(allocationData)).rejects.toThrow();
    });

    test("should validate deliveryMode enum", async () => {
      const allocationData = {
        facilitatorId: 1,
        courseId: 1,
        cohortId: 1,
        trimester: "HT1",
        intakePeriod: "2024S",
        deliveryMode: "invalid-mode",
      };

      await expect(CourseAllocation.create(allocationData)).rejects.toThrow();
    });
  });

  describe("CourseAllocation Associations", () => {
    test("should load facilitator association", async () => {
      const facilitator = await User.create({
        firstName: "John",
        lastName: "Doe",
        emailAddress: "john.doe@example.com",
        passwordHash: "hash",
        userRole: "facilitator",
      });

      const course = await Course.create({
        courseCode: "CS101",
        courseTitle: "Introduction to Computer Science",
        credits: 3,
      });

      const cohort = await Cohort.create({
        cohortName: "2024S",
        startDate: new Date(),
        endDate: new Date(),
      });

      const allocation = await CourseAllocation.create({
        facilitatorId: facilitator.id,
        courseId: course.id,
        cohortId: cohort.id,
        trimester: "HT1",
        intakePeriod: "2024S",
        deliveryMode: "online",
      });

      const allocationWithFacilitator = await CourseAllocation.findByPk(
        allocation.id,
        {
          include: [{ model: User, as: "facilitator" }],
        }
      );

      expect(allocationWithFacilitator.facilitator).toBeDefined();
      expect(allocationWithFacilitator.facilitator.firstName).toBe("John");
      expect(allocationWithFacilitator.facilitator.lastName).toBe("Doe");
    });
  });
});
