import { generateEmbedding } from "./embemdind";
import { prisma } from "./db/prisma";
import { redis } from "./redis";

/**
 * Embedding Cache for Categories, Brands, and Common Terms
 * Uses Redis for fast similarity search without external AI APIs
 */

interface CachedEmbedding {
    id: string;
    name: string;
    embedding: number[];
}

const CACHE_TTL = 60 * 60 * 24; // 24 hours
const CACHE_KEYS = {
    CATEGORIES: "embeddings:categories",
    BRANDS: "embeddings:brands",
};

/**
 * Calculate cosine similarity between two vectors
 */
export function cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) {
        throw new Error("Vectors must have the same length");
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
        dotProduct += a[i] * b[i];
        normA += a[i] * a[i];
        normB += b[i] * b[i];
    }

    const denominator = Math.sqrt(normA) * Math.sqrt(normB);
    if (denominator === 0) return 0;

    return dotProduct / denominator;
}

/**
 * Get or generate category embeddings
 */
export async function getCategoryEmbeddings(): Promise<CachedEmbedding[]> {
    try {
        // Try cache first
        const cached = await redis.get(CACHE_KEYS.CATEGORIES);
        if (cached && typeof cached === 'string') {
            console.log("✅ Category embeddings loaded from cache");
            return JSON.parse(cached);
        }

        console.log("🔄 Generating category embeddings...");

        // Fetch all categories
        const categories = await prisma.category.findMany({
            select: { id: true, name: true, description: true },
        });

        // Generate embeddings for each category
        const embeddings: CachedEmbedding[] = [];
        for (const category of categories) {
            try {
                // Use category name + description for better matching
                const text = category.description
                    ? `${category.name} ${category.description}`
                    : category.name;

                const embedding = await generateEmbedding(text);
                embeddings.push({
                    id: category.id,
                    name: category.name,
                    embedding,
                });
            } catch (error) {
                console.error(`Failed to generate embedding for category ${category.name}:`, error);
            }
        }

        // Cache the results
        await redis.set(
            CACHE_KEYS.CATEGORIES,
            JSON.stringify(embeddings),
            { ex: CACHE_TTL }
        );

        console.log(`✅ Generated and cached ${embeddings.length} category embeddings`);
        return embeddings;
    } catch (error) {
        console.error("❌ Failed to get category embeddings:", error);
        return [];
    }
}

/**
 * Get or generate brand embeddings
 */
export async function getBrandEmbeddings(): Promise<CachedEmbedding[]> {
    try {
        // Try cache first
        const cached = await redis.get(CACHE_KEYS.BRANDS);
        if (cached && typeof cached === 'string') {
            console.log("✅ Brand embeddings loaded from cache");
            return JSON.parse(cached);
        }

        console.log("🔄 Generating brand embeddings...");

        // Fetch all unique brands (filter out null values)
        const allBrands = await prisma.product.findMany({
            select: { brand: true },
            distinct: ["brand"],
        });

        const brands = allBrands.filter(item => item.brand !== null);

        // Generate embeddings for each brand
        const embeddings: CachedEmbedding[] = [];
        for (const { brand } of brands) {
            if (!brand) continue;

            try {
                const embedding = await generateEmbedding(brand);
                embeddings.push({
                    id: brand,
                    name: brand,
                    embedding,
                });
            } catch (error) {
                console.error(`Failed to generate embedding for brand ${brand}:`, error);
            }
        }

        // Cache the results
        await redis.set(
            CACHE_KEYS.BRANDS,
            JSON.stringify(embeddings),
            { ex: CACHE_TTL }
        );

        console.log(`✅ Generated and cached ${embeddings.length} brand embeddings`);
        return embeddings;
    } catch (error) {
        console.error("❌ Failed to get brand embeddings:", error);
        return [];
    }
}

/**
 * Find most similar item from cached embeddings
 */
export function findMostSimilar(
    queryEmbedding: number[],
    cachedEmbeddings: CachedEmbedding[],
    threshold: number = 0.5
): CachedEmbedding | null {
    if (cachedEmbeddings.length === 0) return null;

    let bestMatch: CachedEmbedding | null = null;
    let bestScore = threshold;

    for (const cached of cachedEmbeddings) {
        const similarity = cosineSimilarity(queryEmbedding, cached.embedding);
        if (similarity > bestScore) {
            bestScore = similarity;
            bestMatch = cached;
        }
    }

    if (bestMatch) {
        console.log(`🎯 Best match: "${bestMatch.name}" (similarity: ${bestScore.toFixed(3)})`);
    }

    return bestMatch;
}

/**
 * Find top N similar items from cached embeddings
 */
export function findTopSimilar(
    queryEmbedding: number[],
    cachedEmbeddings: CachedEmbedding[],
    topN: number = 5,
    threshold: number = 0.3
): Array<CachedEmbedding & { similarity: number }> {
    if (cachedEmbeddings.length === 0) return [];

    const results = cachedEmbeddings
        .map((cached) => ({
            ...cached,
            similarity: cosineSimilarity(queryEmbedding, cached.embedding),
        }))
        .filter((item) => item.similarity >= threshold)
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, topN);

    return results;
}

/**
 * Invalidate all embedding caches (call when categories/brands change)
 */
export async function invalidateEmbeddingCaches(): Promise<void> {
    try {
        await redis.del(CACHE_KEYS.CATEGORIES);
        await redis.del(CACHE_KEYS.BRANDS);
        console.log("✅ Embedding caches invalidated");
    } catch (error) {
        console.error("❌ Failed to invalidate caches:", error);
    }
}
