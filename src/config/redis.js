const redis = require("redis");
require("dotenv").config();

const redisClient = redis.createClient({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD || undefined,
});

redisClient.on("error", (error) => {
  console.error("❌ Redis connection error:", error);
});

redisClient.on("connect", () => {
  console.log("✅ Redis connection established successfully");
});

const connectToRedis = async () => {
  try {
    await redisClient.connect();
  } catch (error) {
    console.error("❌ Failed to connect to Redis:", error);
  }
};

module.exports = { redisClient, connectToRedis };
