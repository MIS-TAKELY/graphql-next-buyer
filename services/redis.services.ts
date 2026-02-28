import redisConfig from "@/config/redis";

export async function setCache(key: string, value: any, ttlSeconds = 3600) {
  if (!redisConfig.redis) return;
  try {
    await redisConfig.redis.setex(key, ttlSeconds, JSON.stringify(value));
  } catch (err) {
    console.error(`[Redis] Error setting cache for key ${key}:`, err);
  }
}

export async function getCache<T>(key: string): Promise<T | null> {
  if (!redisConfig.redis) return null;

  try {
    const data = await redisConfig.redis.get(key);

    if (typeof data === "string") {
      try {
        return JSON.parse(data);
      } catch {
        return data as unknown as T;
      }
    }

    return data as T;
  } catch (err) {
    console.error(`[Redis] Error getting cache for key ${key}:`, err);
    return null; // Gracefully fallback to DB on cache error
  }
}

export async function delCache(key: string) {
  if (!redisConfig.redis) return;
  try {
    await redisConfig.redis.del(key);
  } catch (err) {
    console.error(`[Redis] Error deleting cache for key ${key}:`, err);
  }
}
