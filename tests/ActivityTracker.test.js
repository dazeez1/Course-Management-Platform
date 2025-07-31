const {
  ActivityTracker,
  CourseAllocation,
  User,
  Course,
  Cohort,
} = require("../src/models");

describe("ActivityTracker Model", () => {
  beforeAll(async () => {
    // Setup test database connection
    const { sequelize } = require("../src/config/database");
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    // Close database connection
    const { sequelize } = require("../src/config/database");
    await sequelize.close();
  });

  beforeEach(async () => {
    // Clear tables before each test
    await ActivityTracker.destroy({ where: {} });
    await CourseAllocation.destroy({ where: {} });
    await User.destroy({ where: {} });
    await Course.destroy({ where: {} });
    await Cohort.destroy({ where: {} });
  });

  describe("ActivityTracker Creation", () => {
    test("should create an activity log with valid data", async () => {
      // Create required related records
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

      const activityData = {
        allocationId: allocation.id,
        facilitatorId: facilitator.id,
        weekNumber: 1,
        academicYear: "2024",
        attendanceStatus: [true, true, true, true, true],
        formativeOneGrading: "Done",
        formativeTwoGrading: "Done",
        summativeGrading: "Done",
        courseModeration: "Done",
        intranetSync: "Done",
        gradeBookStatus: "Done",
        additionalNotes: "All activities completed successfully",
      };

      const activity = await ActivityTracker.create(activityData);

      expect(activity).toBeDefined();
      expect(activity.allocationId).toBe(allocation.id);
      expect(activity.facilitatorId).toBe(facilitator.id);
      expect(activity.weekNumber).toBe(1);
      expect(activity.academicYear).toBe("2024");
      expect(activity.attendanceStatus).toEqual([true, true, true, true, true]);
      expect(activity.formativeOneGrading).toBe("Done");
      expect(activity.formativeTwoGrading).toBe("Done");
      expect(activity.summativeGrading).toBe("Done");
      expect(activity.courseModeration).toBe("Done");
      expect(activity.intranetSync).toBe("Done");
      expect(activity.gradeBookStatus).toBe("Done");
      expect(activity.additionalNotes).toBe(
        "All activities completed successfully"
      );
    });

    test("should require allocationId", async () => {
      const activityData = {
        facilitatorId: 1,
        weekNumber: 1,
        academicYear: "2024",
        attendanceStatus: [true, true, true, true, true],
        formativeOneGrading: "Done",
      };

      await expect(ActivityTracker.create(activityData)).rejects.toThrow();
    });

    test("should require weekNumber", async () => {
      const activityData = {
        allocationId: 1,
        facilitatorId: 1,
        academicYear: "2024",
        attendanceStatus: [true, true, true, true, true],
        formativeOneGrading: "Done",
      };

      await expect(ActivityTracker.create(activityData)).rejects.toThrow();
    });
  });

  describe("ActivityTracker Validation", () => {
    test("should validate attendanceStatus as array", async () => {
      const activityData = {
        allocationId: 1,
        facilitatorId: 1,
        weekNumber: 1,
        academicYear: "2024",
        attendanceStatus: "not-an-array",
        formativeOneGrading: "Done",
      };

      await expect(ActivityTracker.create(activityData)).rejects.toThrow();
    });

    test("should validate grading status enum", async () => {
      const activityData = {
        allocationId: 1,
        facilitatorId: 1,
        weekNumber: 1,
        academicYear: "2024",
        attendanceStatus: [true, true, true, true, true],
        formativeOneGrading: "InvalidStatus",
      };

      await expect(ActivityTracker.create(activityData)).rejects.toThrow();
    });

    test("should validate weekNumber range", async () => {
      const activityData = {
        allocationId: 1,
        facilitatorId: 1,
        weekNumber: 0, // Invalid week number
        academicYear: "2024",
        attendanceStatus: [true, true, true, true, true],
        formativeOneGrading: "Done",
      };

      await expect(ActivityTracker.create(activityData)).rejects.toThrow();
    });
  });

  describe("ActivityTracker Associations", () => {
    test("should load course allocation association", async () => {
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

      const activity = await ActivityTracker.create({
        allocationId: allocation.id,
        facilitatorId: facilitator.id,
        weekNumber: 1,
        academicYear: "2024",
        attendanceStatus: [true, true, true, true, true],
        formativeOneGrading: "Done",
      });

      const activityWithAllocation = await ActivityTracker.findByPk(
        activity.id,
        {
          include: [{ model: CourseAllocation, as: "courseAllocation" }],
        }
      );

      expect(activityWithAllocation.courseAllocation).toBeDefined();
      expect(activityWithAllocation.courseAllocation.id).toBe(allocation.id);
    });
  });
});
