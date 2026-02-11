import { prisma } from "../db/prisma";
import {
    extractPriceRange,
    extractBrandKeywords,
    extractSpecificationKeywords,
} from "./textAnalysis";
import { callLLM } from "./llm";

/**
 * Clean common marketing prefixes that confuse intent extraction
 */
function cleanQuery(query: string): string {
    return query
        .replace(/^(best|top|featured|today's|hot|latest|new|discounted|trending|popular)\s+/i, "")
        .replace(/\s+(deals?|offers?|products?|items?|sales?|picks?|gadgets?)$/i, "")
        .trim();
}

/**
 * Check if query is generic marketing term or simple keyword
 */
function isGenericMarketingQuery(query: string): boolean {
    const q = query.toLowerCase().trim();
    const wordCount = q.split(/\s+/).length;

    // Fast-path for 1-2 word queries (likely direct categories or products)
    if (wordCount <= 2) return true;

    const genericTerms = [
        "best electronics", "best deals", "featured products", "top offers",
        "today's best deals", "trending now", "latest products", "hot deals",
        "new arrivals", "popular items", "best electronics gadgets"
    ];
    return genericTerms.some(term => q === term || q.includes(term));
}

/**
 * Extracted intent from user query
 * No external AI API required - uses regex + fuzzy matching
 */
export interface ExtractedIntent {
    price_max?: number;
    price_min?: number;
    brand?: string[];
    specifications?: Record<string, string>;
    correctedQuery?: string;
    category?: string;
}

/**
 * Extract structured intent from natural language query
 * 
 * Uses combination of:
 * 1. Regex patterns for price extraction
 * 2. Embedding similarity for brand detection
 * 3. Keyword matching for specifications
 * 
 * No external AI API required!
 * 
 * @param query - User's search query (e.g., "iphone under 1 lakh with good camera")
 * @param availableFilters - List of valid filter keys from CategorySpecification
 * @returns Extracted intent with price, brand, and specifications
 */
export async function extractIntent(
    query: string,
    availableFilters: string[] = []
): Promise<ExtractedIntent> {
    const intent: ExtractedIntent = {};

    try {
        console.log(`🔍 Extracting intent from: "${query}"`);

        // Step 0: Clean query for better matches
        const cleaned = cleanQuery(query);
        const processingQuery = cleaned.length > 2 ? cleaned : query;

        // Step 1: Extract price range using regex
        const priceRange = extractPriceRange(query);
        if (priceRange.max) intent.price_max = priceRange.max;
        if (priceRange.min) intent.price_min = priceRange.min;

        // Step 2: Extract brands using embedding similarity + keywords
        const brandKeywords = extractBrandKeywords(query);

        if (brandKeywords.length > 0) {
            intent.brand = brandKeywords;
        } else {
            // Try fuzzy matching against active brands in the DB
            try {
                // Get all active brands from the database
                const products = await prisma.product.findMany({
                    where: { status: 'ACTIVE' },
                    select: { brand: true },
                    distinct: ['brand']
                });
                const allBrandNames = products.map(p => p.brand);

                const { findFuzzyMatches } = await import("../utils/stringSim");
                const fuzzyMatches = findFuzzyMatches(query, allBrandNames, 3);

                if (fuzzyMatches.length > 0) {
                    const topMatch = fuzzyMatches[0];
                    console.log(`🎯 Fuzzy Brand Match: "${query}" -> "${topMatch.value}" (Score: ${topMatch.score.toFixed(2)})`);
                    intent.brand = [topMatch.value];
                    intent.correctedQuery = topMatch.value;
                }
            } catch (error) {
                console.error("❌ Brand detection failed:", error);
            }
        }

        // Step 3: Extract specifications using keyword matching
        const specs = extractSpecificationKeywords(query);

        // Filter specs to only include those in availableFilters (if provided)
        if (Object.keys(specs).length > 0) {
            intent.specifications = {};
            Object.entries(specs).forEach(([key, value]) => {
                if (availableFilters.length === 0 || availableFilters.includes(key)) {
                    intent.specifications![key] = value;
                }
            });
        }

        // Step 4: Extract category using keywords
        const lowerQuery = query.toLowerCase();
        const lowerCleaned = cleaned.toLowerCase();

        // Check both original and cleaned for better coverage
        const hasKeyword = (k: string, exact: boolean = false) => {
            if (exact) {
                const regex = new RegExp(`\\b${k}\\b`, 'i');
                return regex.test(lowerQuery) || regex.test(lowerCleaned);
            }
            return lowerQuery.includes(k) || lowerCleaned.includes(k);
        };

        if (hasKeyword("phone") || hasKeyword("mobile") || hasKeyword("iphone") || hasKeyword("android") || hasKeyword("smartphone")) intent.category = "Smartphones";
        else if (hasKeyword("laptop") || hasKeyword("computer") || hasKeyword("macbook") || hasKeyword("mac")) intent.category = "Laptop";
        else if (hasKeyword("watch") || hasKeyword("apple watch") || hasKeyword("smartwatch")) intent.category = "Smartwatch";
        else if (hasKeyword("headphone") || hasKeyword("earphone") || hasKeyword("buds") || hasKeyword("airpods")) intent.category = "Music & Sound";
        else if (hasKeyword("tv") || hasKeyword("television") || hasKeyword("led") || hasKeyword("monitor")) intent.category = "Electronics & Gadgets";
        else if (hasKeyword("camera") || hasKeyword("dslr") || hasKeyword("canon") || hasKeyword("nikon")) intent.category = "Camera";
        else if (hasKeyword("speaker") || hasKeyword("bluetooth speaker")) intent.category = "Music & Sound";
        else if (hasKeyword("shoe") || hasKeyword("sneaker") || hasKeyword("boot") || hasKeyword("nike") || hasKeyword("adidas")) intent.category = "Fashion & Apparel";
        else if (hasKeyword("shirt") || hasKeyword("t-shirt") || hasKeyword("cloth") || hasKeyword("apparel")) intent.category = "Fashion & Apparel";
        else if (hasKeyword("oil") || hasKeyword("motul") || hasKeyword("engine")) intent.category = "Automotive & Tools";
        else if (hasKeyword("table") || hasKeyword("chair") || hasKeyword("desk")) intent.category = "Furniture & Home Decor";
        else if (hasKeyword("sofa") || hasKeyword("seating") || hasKeyword("couch")) intent.category = "Furniture & Home Decor";
        else if (hasKeyword("furniture")) intent.category = "Furniture & Home Decor";
        else if (hasKeyword("diaper") || hasKeyword("baby") || hasKeyword("kid")) intent.category = "Baby and Kids";
        // Use exact check for short/ambiguous words like "eat" or "oil" to avoid collisions with "featured" or "boil"
        else if (hasKeyword("grocery") || hasKeyword("food") || hasKeyword("eat", true) || hasKeyword("snack")) intent.category = "Grocery & Gourmet";
        else if (hasKeyword("console") || hasKeyword("playstation") || hasKeyword("ps5") || hasKeyword("ps4") || hasKeyword("xbox") || hasKeyword("gaming")) intent.category = "Electronics & Gadgets";

        // Special case for generic "electronics" on landing page
        if (!intent.category && hasKeyword("electronics")) {
            intent.category = "Electronics & Gadgets";
        }

        console.log("✅ Intent extracted:", JSON.stringify(intent, null, 2));
        return intent;
    } catch (error) {
        console.error("❌ Intent extraction failed:", error);
        return {};
    }
}

/**
 * Check if intent is empty (no filters extracted)
 */
export function isEmptyIntent(intent: ExtractedIntent): boolean {
    return (
        !intent.price_max &&
        !intent.price_min &&
        (!intent.brand || intent.brand.length === 0) &&
        (!intent.specifications || Object.keys(intent.specifications).length === 0)
    );
}

/**
 * Extract intent using LLM (Ollama) with timeout
 */
export async function extractIntentWithLLM(query: string): Promise<ExtractedIntent> {
    const categories = [
        "Fashion & Apparel",
        "Grocery & Gourmet",
        "Health & Wellness",
        "Sports & Outdoors",
        "Beauty & Personal Care",
        "Automotive & Tools",
        "Books & Stationery",
        "Baby and Kids",
        "Electronics & Gadgets",
        "Pet Supplies",
        "Home & Kitchen",
        "Music & Sound",
        "Furniture & Home Decor",
        "Sofas & Seating Furniture",
        "Outdoor Furniture",
        "Smartphones", "Laptop", "Smartwatch", "Camera"
    ];

    const prompt = `Extract e-commerce intent from: "${query}"
    Categories: ${categories.join(", ")}
    JSON format:
    {"category": "matched category or null", "brand": ["brands"], "specifications": {"key": "value"}, "price_min": num, "price_max": num, "cleaned_query": "query without filters"}
    Respond ONLY with JSON.`;

    try {
        const response = await callLLM(prompt, "qwen2.5:3b", 30000); // 30s timeout for first load
        const parsed = JSON.parse(response);

        const intent: ExtractedIntent = {
            category: parsed.category || undefined,
            brand: parsed.brand && parsed.brand.length > 0 ? parsed.brand : undefined,
            specifications: parsed.specifications || undefined,
            price_min: parsed.price_min || undefined,
            price_max: parsed.price_max || undefined,
            correctedQuery: parsed.cleaned_query || undefined,
        };

        return intent;
    } catch (error) {
        console.error("❌ LLM Intent extraction failed:", error);
        return {};
    }
}

/**
 * Extract intent with multiple layers of optimization:
 * 1. Semantic Search (Fast + Context Aware)
 * 2. LLM (Slow but broad)
 * 3. Regex (Fastest fallback)
 */
export async function extractIntentWithTimeout(
    query: string,
    timeoutMs: number = 5000
): Promise<ExtractedIntent> {
    try {
        console.log(`🚀 Starting multi-layered intent extraction for: "${query}"`);

        // Layer 0: Fast-path for generic landing page queries
        if (isGenericMarketingQuery(query)) {
            console.log("⚡ Fast-path match for generic marketing query");
            return await extractIntent(query);
        }

        const cleaned = cleanQuery(query);

        // Layer 1: Semantic Intent (Fast + DB Context)
        const { extractSemanticIntent } = await import("./semanticIntent");
        const semanticRes = await extractSemanticIntent(cleaned.length > 2 ? cleaned : query);

        if (semanticRes.category || (semanticRes.brand && semanticRes.brand.length > 0)) {
            console.log("🎯 Semantic match found!");
            // Still run regex for price/spec extraction as semantic is mostly for cat/brand
            const regexRes = await extractIntent(query);
            return {
                ...semanticRes,
                price_max: regexRes.price_max,
                price_min: regexRes.price_min,
                specifications: regexRes.specifications,
                correctedQuery: regexRes.correctedQuery || semanticRes.category
            };
        }

        // Layer 2: LLM with Timeout
        console.log("🤖 Semantic match too low, trying LLM...");
        const result = await Promise.race([
            extractIntentWithLLM(query),
            new Promise<never>((_, reject) =>
                setTimeout(() => reject(new Error("LLM_TIMEOUT")), timeoutMs)
            ),
        ]);

        return result;
    } catch (error: any) {
        if (error?.message === "LLM_TIMEOUT") {
            console.warn(`⏱️ LLM timeout after ${timeoutMs}ms, using regex fallback for: "${query}"`);
        } else {
            console.error("❌ Intent extraction error:", error);
        }

        // Final Fallback: Regex
        return await extractIntent(query);
    }
}

// Category mapping cache (in-memory LRU cache)
const categoryMappingCache = new Map<string, string | null>();
const MAX_CATEGORY_CACHE_SIZE = 100;

/**
 * Map a raw category name (from LLM or keyword) to the actual name in DB
 */
export async function mapCategoryToDB(categoryName: string): Promise<string | null> {
    // Check cache first
    if (categoryMappingCache.has(categoryName)) {
        return categoryMappingCache.get(categoryName)!;
    }

    try {
        const dbCat = await prisma.category.findFirst({
            where: { name: { contains: categoryName, mode: 'insensitive' } },
            select: { name: true }
        });

        const result = dbCat ? dbCat.name : null;

        // Add to cache with LRU eviction
        if (categoryMappingCache.size >= MAX_CATEGORY_CACHE_SIZE) {
            // Remove oldest entry (first key)
            const firstKey = categoryMappingCache.keys().next().value;
            if (firstKey !== undefined) {
                categoryMappingCache.delete(firstKey);
            }
        }
        categoryMappingCache.set(categoryName, result);

        return result;
    } catch (e) {
        console.error("Category mapping failed:", e);
        return null;
    }
}



