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

// In-memory locks to prevent concurrent generation
let isGeneratingCategories = false;
let isGeneratingBrands = false;


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
    if (isGeneratingCategories) {
        console.log("⏳ Category embedding generation already in progress...");
        return [];
    }


    try {
        // Try cache first
        const cached = await redis.get(CACHE_KEYS.CATEGORIES);
        if (cached && typeof cached === 'string') {
            return JSON.parse(cached);
        }

        isGeneratingCategories = true;
        console.log("🔄 Generating category embeddings (this may take a while)...");

        // Fetch all categories
        const categories = await prisma.category.findMany({
            select: { id: true, name: true, description: true },
        });

        // Generate embeddings for each category
        const embeddings: CachedEmbedding[] = [];
        for (let i = 0; i < categories.length; i++) {
            const category = categories[i];
            try {
                const text = category.description
                    ? `${category.name} ${category.description}`
                    : category.name;

                const embedding = await generateEmbedding(text);
                embeddings.push({
                    id: category.id,
                    name: category.name,
                    embedding,
                });

                if (i % 10 === 0 && i > 0) {
                    console.log(`⏳ Progress: ${i}/${categories.length} categories indexed`);
                }
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
    } finally {
        isGeneratingCategories = false;
    }
}


/**
 * Get or generate brand embeddings
 */
export async function getBrandEmbeddings(): Promise<CachedEmbedding[]> {
    if (isGeneratingBrands) {
        console.log("⏳ Brand embedding generation already in progress...");
        return [];
    }


    try {
        // Try cache first
        const cached = await redis.get(CACHE_KEYS.BRANDS);
        if (cached && typeof cached === 'string') {
            return JSON.parse(cached);
        }

        isGeneratingBrands = true;
        console.log("🔄 Generating brand embeddings...");

        // Fetch all unique brands
        const allBrands = await prisma.product.findMany({
            select: { brand: true },
            distinct: ["brand"],
            where: { brand: { not: "" } }
        });

        const brands = allBrands.filter(item => item.brand !== null);

        // Generate embeddings for each brand
        const embeddings: CachedEmbedding[] = [];
        for (let i = 0; i < brands.length; i++) {
            const { brand } = brands[i];
            if (!brand) continue;

            try {
                const embedding = await generateEmbedding(brand);
                embeddings.push({
                    id: brand,
                    name: brand,
                    embedding,
                });

                if (i % 20 === 0 && i > 0) {
                    console.log(`⏳ Progress: ${i}/${brands.length} brands indexed`);
                }
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
    } finally {
        isGeneratingBrands = false;
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
