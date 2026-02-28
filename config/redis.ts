import { Redis as UpstashRedis } from "@upstash/redis";

// When running on Next.js Edge Runtime, we cannot use ioredis because it relies on Node.js net/tls modules.
// Thus, we fallback to Upstash Redis REST API only for those specific functions.
// To fully self-host without Upstash, we would need to run a local Redis REST proxy (e.g. Webdis)
// and point UpstashRedis to that URL.

const REDIS_URL = process.env.REDIS_URL || "redis://127.0.0.1:6379";
const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

let redis: any;
let publisher: any;

// Use standard Redis for subscriber (requires ioredis, which crashes Edge)
// We avoid importing ioredis at the top level to prevent Edge crashes
if (typeof window === "undefined" && process.env.NEXT_RUNTIME !== "edge") {
    const IORedis = require("ioredis");
    redis = new IORedis(REDIS_URL);
    publisher = new IORedis(REDIS_URL);
    redis.on("connect", () => console.log("ioredis connected"));
    redis.on("error", (err: any) => console.error("ioredis error:", err));
} else {
    // Edge runtime fallback
    redis = new UpstashRedis({ url: UPSTASH_URL!, token: UPSTASH_TOKEN! });
    publisher = redis;
}

export default { redis, publisher };
