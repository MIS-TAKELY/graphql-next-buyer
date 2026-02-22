// Script to clear stale Redis cache for the smartphones section
// Run with: node -r dotenv/config scripts/clear-smartphones-cache.mjs
import { Redis } from "@upstash/redis";
import * as dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";

// Load .env.local
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, "../.env.local");
if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
} else {
    dotenv.config();
}

const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

const keysToDelete = [
    "category-swiper:Smart phones",
    "category-swiper:smart phones",
    "category-swiper:Smartphones",
    "category-swiper:smartphones",
    "top-deals:smart phones:8",
    "top-deals:smartphones:8",
    "top-deals:Smart phones:8",
    "top-deals:Smartphones:8",
];

console.log("🗑️  Clearing stale Redis cache for smartphones section...");

for (const key of keysToDelete) {
    try {
        const deleted = await redis.del(key);
        if (deleted) {
            console.log(`✅ Deleted key: "${key}"`);
        } else {
            console.log(`ℹ️  Key not found (already clear): "${key}"`);
        }
    } catch (err) {
        console.error(`❌ Failed to delete "${key}":`, err.message);
    }
}

console.log("✅ Done! The next page load will fetch fresh data without the camera product.");
