
import { Redis } from "@upstash/redis";
import * as dotenv from "dotenv";

dotenv.config();

// Re-create the redis client locally since we can't easily import from @/lib/redis
const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

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
