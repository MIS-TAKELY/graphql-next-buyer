import redisConfig from "@/config/redis";

const memoryStore = new Map<string, { count: number; expiresAt: number }>();
const MAX_MEMORY_STORE_SIZE = 10000;

function cleanupMemoryStore() {
    const now = Date.now();
    for (const [key, entry] of memoryStore) {
        if (now > entry.expiresAt) {
            memoryStore.delete(key);
        }
    }
}

function memoryRateLimit(key: string, limit: number, windowSeconds: number): boolean {
    const now = Date.now();

    if (memoryStore.size > MAX_MEMORY_STORE_SIZE) {
        cleanupMemoryStore();
    }

    const entry = memoryStore.get(key);

    if (!entry || now > entry.expiresAt) {
        memoryStore.set(key, { count: 1, expiresAt: now + windowSeconds * 1000 });
        return true;
    }

    entry.count++;
    return entry.count <= limit;
}

/**
 * Simple Fixed Window Rate Limiter
 * Uses Redis when available, falls back to in-memory store.
 * Fails closed (denies) if both are unavailable.
 * @param key Unique key (e.g., user IP or ID + action)
 * @param limit Max requests allowed
 * @param windowSeconds Time window in seconds
 * @returns true if allowed, false if limit exceeded
 */
export async function rateLimit(key: string, limit: number, windowSeconds: number): Promise<boolean> {
    const redis = redisConfig.redis;
    if (!redis) {
        console.warn("Redis not available for rate limiting - using in-memory fallback");
        return memoryRateLimit(key, limit, windowSeconds);
    }

    try {
        const usage = await redis.incr(key);
        if (usage === 1) {
            await redis.expire(key, windowSeconds);
        }
        return usage <= limit;
    } catch (error) {
        console.error("Rate limit Redis error, using in-memory fallback:", error);
        return memoryRateLimit(key, limit, windowSeconds);
    }
}
