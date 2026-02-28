import { CacheService } from "./services/CacheService";
import { getCached, setCached } from "./lib/cache/cacheUtils";

async function runTests() {
    console.log("🚀 Starting cache fix verification...");

    const testArray = [{ id: 1, name: "Test Product" }];
    const cacheKey = "test:fix:verification";

    // Test CacheService
    console.log("\n--- Testing CacheService ---");
    await CacheService.set(cacheKey, testArray, 60);
    const retrievedCacheService = await CacheService.get<any[]>(cacheKey);

    console.log("Type of retrieved data:", typeof retrievedCacheService);
    if (Array.isArray(retrievedCacheService)) {
        console.log("✅ SUCCESS: CacheService returned an array.");
        console.log("Map result:", retrievedCacheService.map(p => p.name));
    } else {
        console.error("❌ FAILURE: CacheService returned", typeof retrievedCacheService);
    }

    // Test cacheUtils
    console.log("\n--- Testing cacheUtils ---");
    const utilsKey = "test:utils:fix";
    await setCached(utilsKey, testArray, 60);
    const retrievedUtils = await getCached<any[]>(utilsKey);

    console.log("Type of retrieved data:", typeof retrievedUtils);
    if (Array.isArray(retrievedUtils)) {
        console.log("✅ SUCCESS: cacheUtils returned an array.");
        console.log("Map result:", retrievedUtils.map(p => p.name));
    } else {
        console.error("❌ FAILURE: cacheUtils returned", typeof retrievedUtils);
    }

    process.exit(0);
}

runTests().catch(err => {
    console.error("Critical error during verification:", err);
    process.exit(1);
});
