import Redis from "ioredis";
import * as dotenv from "dotenv";

dotenv.config();

const REDIS_URL = process.env.REDIS_URL || "redis://127.0.0.1:6379";
const redis = new Redis(REDIS_URL);

async function main() {
    const slug = "samsung-galaxy-s25-ultra-5g-smartphone-200mp-camera-ai-features-s-pen-long-battery-life";
    const version = "v2";
    const key = `product:details:${version}:${slug}`;

    console.log(`Deleting cache key: ${key}`);
    const deleted = await redis.del(key);
    console.log(`Deleted ${deleted} items.`);

    // Also clear list cache just in case
    await redis.del("products:all");
    console.log("Cleared products:all cache");
}

main().catch(console.error);
