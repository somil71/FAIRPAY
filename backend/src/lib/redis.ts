import Redis from "ioredis";
import dotenv from "dotenv";
dotenv.config();

const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
  maxRetriesPerRequest: null,
  lazyConnect: true,
  retryStrategy: (times) => {
    return null; // Don't retry
  },
});

redis.on("error", (err) => {
  // Silent error to prevent crash
});

export default redis;
