import { prisma } from "../db/prisma";
import {
    extractPriceRange,
    extractBrandKeywords,
    extractSpecificationKeywords,
} from "./textAnalysis";

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

