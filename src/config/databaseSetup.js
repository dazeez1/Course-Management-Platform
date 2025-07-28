const { databaseConnection } = require("./database");
const models = require("../models"); // Ensures all models and associations are loaded

const initializeDatabase = async () => {
  try {
    // Sync all models with database
    await databaseConnection.sync({ force: true });
    console.log("✅ Database tables synchronized successfully");

    // Create default admin user if not exists
    const adminExists = await models.User.findOne({
      where: { emailAddress: "admin@institution.com" },
    });

    if (!adminExists) {
      await models.User.create({
        firstName: "System",
        lastName: "Administrator",
        emailAddress: "admin@institution.com",
        passwordHash: "admin123", // Will be hashed by the model hook
        userRole: "manager",
        isActive: true,
      });
      console.log("✅ Default admin user created");
    }

    // Create sample data for testing
    await createSampleData();

    console.log("✅ Database initialization completed");
  } catch (error) {
    console.error("❌ Database initialization failed:", error);
    throw error;
  }
};

const createSampleData = async () => {
  try {
    // Create sample courses
    await models.Course.bulkCreate(
      [
        {
          courseCode: "CS101",
          courseTitle: "Introduction to Computer Science",
          courseDescription:
            "Fundamental concepts of programming and computer science",
          creditHours: 3,
        },
        {
          courseCode: "MATH201",
          courseTitle: "Advanced Mathematics",
          courseDescription: "Advanced mathematical concepts and applications",
          creditHours: 4,
        },
        {
          courseCode: "ENG301",
          courseTitle: "Technical Writing",
          courseDescription:
            "Professional writing skills for technical documentation",
          creditHours: 3,
        },
      ],
      { ignoreDuplicates: true }
    );

    // Create sample cohorts
    await models.Cohort.bulkCreate(
      [
        {
          cohortName: "2024-Spring",
          startDate: "2024-01-15",
          endDate: "2024-05-15",
        },
        {
          cohortName: "2024-Fall",
          startDate: "2024-09-01",
          endDate: "2024-12-20",
        },
      ],
      { ignoreDuplicates: true }
    );

    // Create sample facilitators
    await models.User.bulkCreate(
      [
        {
          firstName: "John",
          lastName: "Smith",
          emailAddress: "john.smith@institution.com",
          passwordHash: "facilitator123",
          userRole: "facilitator",
        },
        {
          firstName: "Sarah",
          lastName: "Johnson",
          emailAddress: "sarah.johnson@institution.com",
          passwordHash: "facilitator123",
          userRole: "facilitator",
        },
      ],
      { ignoreDuplicates: true }
    );

    console.log("✅ Sample data created successfully");
  } catch (error) {
    console.log(
      "ℹ️ Sample data already exists or error occurred:",
      error.message
    );
  }
};

module.exports = { initializeDatabase };
