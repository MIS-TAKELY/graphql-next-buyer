
import "dotenv/config";
import redisConfig from "./config/redis";

async function test() {
    const key = "test:json-behavior";
    const value = { foo: "bar" };

    console.log("Redis instance:", !!redisConfig.redis);

    // Test 1: Set with JSON.stringify (current implementation)
    await redisConfig.redis.set(key, JSON.stringify(value));
    const data1 = await redisConfig.redis.get(key);
    console.log("Test 1 (stringify): Type of data:", typeof data1, "Value:", data1);

    // Test 2: Set without JSON.stringify
    await redisConfig.redis.set(key + ":raw", value);
    const data2 = await redisConfig.redis.get(key + ":raw");
    console.log("Test 2 (raw): Type of data:", typeof data2, "Value:", data2);
}

test().catch(console.error);
