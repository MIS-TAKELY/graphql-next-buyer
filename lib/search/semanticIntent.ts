import { getEmbedding } from "./embedding";
import { prisma } from "../db/prisma";
import { getCached, setCached } from "../cache/cacheUtils";

interface SemanticMatch {
    value: string;
    score: number;
}

// In-memory cache for candidate embeddings to avoid repetitive Redis calls
const candidateEmbeddingCache = new Map<string, number[]>();

/**
 * Find semantic matches for a query against a list of candidates
 */
async function findSemanticMatches(
    queryEmbedding: number[],
    candidates: string[],
    threshold: number = 0.7
): Promise<SemanticMatch[]> {
    // Process candidates in parallel or use in-memory cache
    const matches = await Promise.all(candidates.map(async (candidate) => {
        let candidateEmbedding = candidateEmbeddingCache.get(candidate);

        if (candidateEmbedding === undefined) {
            const cacheKey = `embedding:text:${Buffer.from(candidate).toString('base64')}`;
            const cached = await getCached<number[]>(cacheKey);
            candidateEmbedding = cached || undefined;

            if (!candidateEmbedding) {
                candidateEmbedding = await getEmbedding(candidate);
                await setCached(cacheKey, candidateEmbedding, 86400 * 7);
            }
            candidateEmbeddingCache.set(candidate, candidateEmbedding);
        }

        const score = cosineSimilarity(queryEmbedding, candidateEmbedding!);
        return score >= threshold ? { value: candidate, score } : null;
    }));

    return (matches.filter(m => m !== null) as SemanticMatch[])
        .sort((a, b) => b.score - a.score);
}

function cosineSimilarity(a: number[], b: number[]): number {
    let dotProduct = 0;
    let mA = 0;
    let mB = 0;
    for (let i = 0; i < a.length; i++) {
        dotProduct += a[i] * b[i];
        mA += a[i] * a[i];
        mB += b[i] * b[i];
    }
    mA = Math.sqrt(mA);
    mB = Math.sqrt(mB);
    return dotProduct / (mA * mB);
}

// In-memory cache for categories and brands
let cachedCategoryNames: string[] | null = null;
let cachedBrandNames: string[] | null = null;
let lastCacheUpdate = 0;
const CACHE_TTL = 3600 * 1000; // 1 hour

/**
 * Semantically extract category and brand from query
 */
export async function extractSemanticIntent(query: string) {
    try {
        const now = Date.now();
        if (!cachedCategoryNames || !cachedBrandNames || now - lastCacheUpdate > CACHE_TTL) {
            console.log("🔄 Refreshing semantic category/brand cache...");
            // 1. Get Categories
            const categories = await prisma.category.findMany({
                where: { isActive: true },
                select: { name: true }
            });
            cachedCategoryNames = categories.map(c => c.name);

            // 2. Get Brands
            const products = await prisma.product.findMany({
                where: { status: 'ACTIVE' },
                select: { brand: true },
                distinct: ['brand']
            });
            cachedBrandNames = products.map(p => p.brand);
            lastCacheUpdate = now;
        }

        const queryEmbedding = await getEmbedding(query);
        const categoryMatches = await findSemanticMatches(queryEmbedding, cachedCategoryNames, 0.82);
        const brandMatches = await findSemanticMatches(queryEmbedding, cachedBrandNames, 0.85);

        return {
            category: categoryMatches.length > 0 ? categoryMatches[0].value : undefined,
            brand: brandMatches.length > 0 ? [brandMatches[0].value] : undefined,
        };
    } catch (error) {
        console.error("Semantic intent extraction failed:", error);
        return {};
    }
}
