import Redis from "ioredis";
import * as dotenv from "dotenv";

dotenv.config();

const REDIS_URL = process.env.REDIS_URL || "redis://127.0.0.1:6379";
const redis = new Redis(REDIS_URL);

async function main() {
    console.log("Fetching matching keys...");

    // Pattern for top deals
    const topDealsKeys = await redis.keys("top-deals:*");
    console.log(`Found ${topDealsKeys.length} top-deals keys.`);

    // Pattern for swipers
    const swiperKeys = await redis.keys("category-swiper:*");
    console.log(`Found ${swiperKeys.length} category-swiper keys.`);

    const allKeys = [...topDealsKeys, ...swiperKeys];

    if (allKeys.length === 0) {
        console.log("No matching keys found.");
        return;
    }

    console.log(`Deleting ${allKeys.length} keys...`);
    const deletedCount = await redis.del(...allKeys);
    console.log(`Successfully deleted ${deletedCount} keys.`);
}

main().catch(console.error);
