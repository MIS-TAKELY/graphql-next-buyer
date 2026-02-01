
import { Redis } from "@upstash/redis";
import * as dotenv from "dotenv";

dotenv.config();

const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

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
