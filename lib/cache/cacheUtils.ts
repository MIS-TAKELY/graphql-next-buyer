import { redis } from "../redis";
import crypto from "crypto";

/**
 * Cache utilities for dynamic filter optimization
 */

// In-flight request tracking to prevent duplicate concurrent calls
const inflightRequests = new Map<string, Promise<any>>();

/**
 * Generate a cache key from a search term
 */
export function generateCacheKey(searchTerm: string, prefix: string = "filter:intent"): string {
    const hash = crypto.createHash("md5").update(searchTerm.toLowerCase().trim()).digest("hex");
    return `${prefix}:${hash}`;
}

/**
 * Get cached data with type safety
 */
export async function getCached<T>(key: string): Promise<T | null> {
    try {
        const cached = await redis.get(key);
        if (!cached) return null;

        if (typeof cached === "string") {
            try {
                return JSON.parse(cached) as T;
            } catch (e) {
                return cached as unknown as T;
            }
        }
        return cached as T;
    } catch (error) {
        console.error(`❌ Redis GET error for key ${key}:`, error);
        return null;
    }
}

/**
 * Set cached data with TTL (in seconds)
 */
export async function setCached<T>(key: string, value: T, ttl: number = 3600): Promise<void> {
    try {
        await redis.setex(key, ttl, typeof value === 'string' ? value : JSON.stringify(value));
        console.log(`✅ Cached: ${key} (TTL: ${ttl}s)`);
    } catch (error) {
        console.error(`❌ Redis SET error for key ${key}:`, error);
    }
}

/**
 * Delete cached data
 */
export async function deleteCached(key: string): Promise<void> {
    try {
        await redis.del(key);
        console.log(`🗑️ Deleted cache: ${key}`);
    } catch (error) {
        console.error(`❌ Redis DEL error for key ${key}:`, error);
    }
}

/**
 * Deduplicate concurrent requests for the same key
 * Returns existing promise if request is in-flight, otherwise executes the function
 */
export async function deduplicateRequest<T>(
    key: string,
    fn: () => Promise<T>
): Promise<T> {
    // Check if request is already in-flight
    if (inflightRequests.has(key)) {
        console.log(`⏳ Deduplicating request for: ${key}`);
        return inflightRequests.get(key) as Promise<T>;
    }

    // Execute the function and track it
    const promise = fn().finally(() => {
        // Clean up after completion
        inflightRequests.delete(key);
    });

    inflightRequests.set(key, promise);
    return promise;
}

/**
 * Get cache statistics
 */
export async function getCacheStats(): Promise<{ hits: number; misses: number; hitRate: number } | null> {
    try {
        // Note: Upstash Redis doesn't support INFO command
        // We'll need to track this manually or use a different approach
        return null;
    } catch (error) {
        console.error("❌ Error getting cache stats:", error);
        return null;
    }
}
