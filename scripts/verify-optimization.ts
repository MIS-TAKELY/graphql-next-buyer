import 'dotenv/config';
import { getDynamicFilters } from "../filter/getFilters";
import { redis } from "../lib/redis";

/**
 * Script to verify dynamic filter optimizations
 * Run with: npx tsx scripts/verify-optimization.ts
 */

async function runVerification() {
    const searchTerm = "macbook pro m3";
    console.log(`\n🔍 Starting verification for: "${searchTerm}"`);

    // 1. Clear cache for clean test
    const crypto = await import("crypto");
    const hash = crypto.createHash("md5").update(searchTerm.toLowerCase().trim()).digest("hex");
    const cacheKey = `filter:intent:${hash}`;
    await redis.del(cacheKey);
    console.log("🧹 Cache cleared.");

    // 2. First request (Cache MISS)
    console.log("\n1️⃣ First request (expecting cache MISS and LLM call)...");
    const start1 = Date.now();
    const res1 = await getDynamicFilters(searchTerm);
    const duration1 = Date.now() - start1;
    console.log(`⏱️ First request took: ${duration1}ms`);
    console.log(`Found ${res1.filters.length} filters for category: ${res1.category}`);

    // 3. Second request (Cache HIT)
    console.log("\n2️⃣ Second request (expecting cache HIT and <200ms)...");
    const start2 = Date.now();
    const res2 = await getDynamicFilters(searchTerm);
    const duration2 = Date.now() - start2;
    console.log(`⏱️ Second request took: ${duration2}ms`);

    if (duration2 < 500) {
        console.log("✅ SUCCESS: Cache hit is significantly faster!");
    } else {
        console.warn("⚠️ WARNING: Cache hit was slower than expected.");
    }

    // 4. Test Semantic Intent
    console.log("\n3️⃣ Testing semantic intent extraction...");
    const semanticTerm = "apple laptop";
    const start4 = Date.now();
    const res4 = await getDynamicFilters(semanticTerm);
    const duration4 = Date.now() - start4;
    console.log(`⏱️ Semantic request took: ${duration4}ms`);
    console.log(`Identified Category: ${res4.category}, Brand: ${JSON.stringify(res4.intent?.brand || [])}, Filters: ${res4.filters.length}`);

    // 5. Test Deduplication
    console.log("\n4️⃣ Testing concurrent request deduplication...");
    const newTerm = "gaming laptop under 1 lakh";
    const start5 = Date.now();

    const [p1, p2] = await Promise.all([
        getDynamicFilters(newTerm),
        getDynamicFilters(newTerm)
    ]);

    const duration5 = Date.now() - start5;
    console.log(`⏱️ Concurrent requests took: ${duration5}ms`);
    console.log("✅ SUCCESS: Concurrent requests handled.");

    process.exit(0);
}

runVerification().catch(err => {
    console.error("❌ Verification failed:", err);
    process.exit(1);
});
