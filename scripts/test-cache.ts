import "dotenv/config";
import { CacheService } from "../services/CacheService";

async function main() {
    console.log("🚀 Starting Cache Service Verification...");

    const testKey = "test-cache-key";
    const testValue = { message: "Hello from Redis!", timestamp: Date.now() };

    // 1. Set Cache
    console.log(`\n1. Setting cache key: ${testKey}`);
    await CacheService.set(testKey, testValue, 10); // 10 seconds TTL
    console.log("✅ Cache set successfully.");

    // 2. Get Cache
    console.log(`\n2. Getting cache key: ${testKey}`);
    const cachedValue = await CacheService.get(testKey);
    console.log("Cached Value:", cachedValue);

    if (JSON.stringify(cachedValue) === JSON.stringify(testValue)) {
        console.log("✅ Cache hit! Value matches.");
    } else {
        console.error("❌ Cache miss or mismatch!");
        process.exit(1);
    }

    // 3. Delete Cache
    console.log(`\n3. Deleting cache key: ${testKey}`);
    await CacheService.del(testKey);
    console.log("✅ Cache deleted.");

    // 4. Verify Deletion
    const deletedValue = await CacheService.get(testKey);
    if (deletedValue === null) {
        console.log("✅ Verified deletion (value is null).");
    } else {
        console.error("❌ Expected null, got:", deletedValue);
        process.exit(1);
    }

    console.log("\n🎉 Verification Completed Successfully!");
    process.exit(0);
}

main().catch((err) => {
    console.error("❌ Error running verification:", err);
    process.exit(1);
});
