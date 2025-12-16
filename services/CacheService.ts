import { redis } from "@/lib/redis";

const DEFAULT_TTL = 3600; // 1 hour

export class CacheService {
    /**
     * Get a value from the cache
     * @param key The cache key
     * @returns The cached value or null if not found
     */
    static async get<T>(key: string): Promise<T | null> {
        try {
            const data = await redis.get(key);
            if (!data) return null;
            // Redis clients might return the object directly if it's JSON, 
            // but Upstash Redis REST client usually handles JSON parsing automatically.
            return data as T;
        } catch (error) {
            console.error(`[CacheService] Error getting key ${key}:`, error);
            return null;
        }
    }

    /**
     * Set a value in the cache
     * @param key The cache key
     * @param value The value to cache
     * @param ttlSeconds Time to live in seconds (default: 1 hour)
     */
    static async set(key: string, value: any, ttlSeconds: number = DEFAULT_TTL): Promise<void> {
        try {
            await redis.set(key, value, { ex: ttlSeconds });
        } catch (error) {
            console.error(`[CacheService] Error setting key ${key}:`, error);
        }
    }

    /**
     * Delete a value from the cache
     * @param key The cache key
     */
    static async del(key: string): Promise<void> {
        try {
            await redis.del(key);
        } catch (error) {
            console.error(`[CacheService] Error deleting key ${key}:`, error);
        }
    }

    /**
     * Generate a standardized cache key
     * @param prefix The domain/feature prefix (e.g., "product", "page")
     * @param id The unique identifier
     */
    static generateKey(prefix: string, id: string): string {
        return `${prefix}:${id}`;
    }

    /**
     * Generate product detail cache key (matches seller's invalidation pattern)
     * @param slug Product slug
     * 
     * Version History:
     * - v1: Initial implementation
     * - v2: Added seller.id field to GraphQL query (2025-12-16)
     */
    static getProductDetailKey(slug: string): string {
        const VERSION = 'v2'; // Increment this when product data structure changes
        return `product:details:${VERSION}:${slug}`;
    }

    /**
     * Generate products list cache key
     */
    static getProductsListKey(): string {
        return 'products:all';
    }
}
