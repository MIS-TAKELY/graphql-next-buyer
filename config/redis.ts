// src/config/redis.ts
import Redis from "ioredis";

// const redis = new Redis({}); if redish i running in docker/locally

const redis = new Redis(process.env.REDIS_URL || "");

redis.on("connect", () => console.log("Redis connected"));
redis.on("error", (err) => console.error("Redis error:", err));

export default redis;
