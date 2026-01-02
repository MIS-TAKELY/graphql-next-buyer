import redisConfig from "@/config/redis";

export async function setCache(key: string, value: any, ttlSeconds = 3600) {
  if (!redisConfig.redis) throw new Error("Redis not initialized");
  await redisConfig.redis.set(key, JSON.stringify(value), { ex: ttlSeconds });
}

export async function getCache<T>(key: string): Promise<T | null> {
  if (!redisConfig.redis) return null;
  const data = await redisConfig.redis.get(key);

  if (typeof data === "string") {
    try {
      return JSON.parse(data);
    } catch {
      return data as unknown as T;
    }
  }

  return data as T;
}

export async function delCache(key: string) {
  if (!redisConfig.redis) return;
  await redisConfig.redis.del(key);
}
