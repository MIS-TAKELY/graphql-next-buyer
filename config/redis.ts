// Edge runtime fallback
const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

const REDIS_URL = process.env.REDIS_URL || "redis://127.0.0.1:6379";

let redis: any;
let publisher: any;

if (typeof window === "undefined" && process.env.NEXT_RUNTIME !== "edge") {
    const IORedis = require("ioredis");
    redis = new IORedis(REDIS_URL);
    publisher = new IORedis(REDIS_URL);
    redis.on("connect", () => console.log("ioredis connected"));
    redis.on("error", (err: any) => console.error("ioredis error:", err));
} else {
    // Edge runtime or browser fallback - dummy mocks
    redis = {
        get: async () => null,
        set: async () => { },
        setex: async () => { },
        del: async () => { },
        on: () => { },
    };
    publisher = redis;
}

export default { redis, publisher };
