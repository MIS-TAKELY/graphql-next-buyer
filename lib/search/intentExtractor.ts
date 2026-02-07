import { prisma } from "../db/prisma";
import {
    extractPriceRange,
    extractBrandKeywords,
    extractSpecificationKeywords,
} from "./textAnalysis";
import { callLLM } from "./llm";

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
        if (lowerQuery.includes("phone") || lowerQuery.includes("mobile") || lowerQuery.includes("iphone") || lowerQuery.includes("android")) intent.category = "Smartphones";
        else if (lowerQuery.includes("laptop") || lowerQuery.includes("computer") || lowerQuery.includes("macbook") || lowerQuery.includes("mac")) intent.category = "Laptop";
        else if (lowerQuery.includes("watch") || lowerQuery.includes("apple watch") || lowerQuery.includes("smartwatch")) intent.category = "Smartwatch";
        else if (lowerQuery.includes("headphone") || lowerQuery.includes("earphone") || lowerQuery.includes("buds") || lowerQuery.includes("airpods")) intent.category = "Music & Sound";
        else if (lowerQuery.includes("tv") || lowerQuery.includes("television") || lowerQuery.includes("led") || lowerQuery.includes("monitor")) intent.category = "Electronics & Gadgets";
        else if (lowerQuery.includes("camera") || lowerQuery.includes("dslr") || lowerQuery.includes("canon") || lowerQuery.includes("nikon")) intent.category = "Camera";
        else if (lowerQuery.includes("speaker") || lowerQuery.includes("bluetooth speaker")) intent.category = "Music & Sound";
        else if (lowerQuery.includes("shoe") || lowerQuery.includes("sneaker") || lowerQuery.includes("boot") || lowerQuery.includes("nike") || lowerQuery.includes("adidas")) intent.category = "Fashion & Apparel";
        else if (lowerQuery.includes("shirt") || lowerQuery.includes("t-shirt") || lowerQuery.includes("cloth") || lowerQuery.includes("apparel")) intent.category = "Fashion & Apparel";
        else if (lowerQuery.includes("oil") || lowerQuery.includes("motul") || lowerQuery.includes("engine")) intent.category = "Automotive & Tools";
        else if (lowerQuery.includes("table") || lowerQuery.includes("chair") || lowerQuery.includes("desk")) intent.category = "Furniture & Home Decor";
        else if (lowerQuery.includes("sofa") || lowerQuery.includes("seating") || lowerQuery.includes("couch")) intent.category = "Furniture & Home Decor";
        else if (lowerQuery.includes("furniture")) intent.category = "Furniture & Home Decor";
        else if (lowerQuery.includes("diaper") || lowerQuery.includes("baby") || lowerQuery.includes("kid")) intent.category = "Baby and Kids";
        else if (lowerQuery.includes("grocery") || lowerQuery.includes("food") || lowerQuery.includes("eat") || lowerQuery.includes("snack")) intent.category = "Grocery & Gourmet";
        else if (lowerQuery.includes("console") || lowerQuery.includes("playstation") || lowerQuery.includes("ps5") || lowerQuery.includes("ps4") || lowerQuery.includes("xbox") || lowerQuery.includes("gaming")) intent.category = "Electronics & Gadgets";

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
        const response = await callLLM(prompt);
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

        // Layer 1: Semantic Intent (Fast + DB Context)
        const { extractSemanticIntent } = await import("./semanticIntent");
        const semanticRes = await extractSemanticIntent(query);

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



