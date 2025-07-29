const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const { testDatabaseConnection } = require("./config/database");
const { connectToRedis } = require("./config/redis");
const { initializeDatabase } = require("./config/databaseSetup");
const NotificationWorker = require("./workers/notificationWorker");

const courseRoutes = require("./routes/courseRoutes");
const userRoutes = require("./routes/userRoutes");
const activityRoutes = require("./routes/activityRoutes");
const authRoutes = require("./routes/authRoutes");

const errorHandler = require("./middleware/errorHandler");
const { authenticateToken } = require("./middleware/authentication");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors());
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use(limiter);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Course Management Platform is running",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", authenticateToken, userRoutes);
app.use("/api/v1/courses", authenticateToken, courseRoutes);
app.use("/api/v1/activities", authenticateToken, activityRoutes);

app.use(errorHandler);
app.use("*", (req, res) => {
  res.status(404).json({
    error: "Route not found",
    message: `Cannot ${req.method} ${req.originalUrl}`,
  });
});

const startServer = async () => {
  try {
    await testDatabaseConnection();
    await initializeDatabase();
    await connectToRedis();

    // Start notification worker
    const notificationWorker = new NotificationWorker();
    await notificationWorker.start();

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📚 Course Management Platform API ready`);
      console.log(`🔗 Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
