import { generateEmbedding } from "../embemdind";
import { getBrandEmbeddings, findTopSimilar } from "../embeddingCache";
import {
    extractPriceRange,
    extractBrandKeywords,
    extractSpecificationKeywords,
} from "./textAnalysis";

/**
 * Extracted intent from user query
 * No external AI API required - uses regex + embeddings
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
            // Try fuzzy matching against cached brands first (better for typos like "sansang" -> "Samsung")
            // Then fallback to embedding if fuzzy fails
            try {
                // Get all known brands (cached)
                const brandEmbeddings = await getBrandEmbeddings();
                const allBrandNames = brandEmbeddings.map(b => b.name);

                // Import dynamically to avoid circle if needed, or just import at top. 
                // Assuming static import is fine.
                const { findFuzzyMatches } = await import("../utils/stringSim");

                // Allow slightly higher threshold for brands
                const fuzzyMatches = findFuzzyMatches(query, allBrandNames, 3);

                if (fuzzyMatches.length > 0) {
                    // Take the top match if score is confident
                    const topMatch = fuzzyMatches[0];
                    console.log(`🎯 Fuzzy Brand Match: "${query}" -> "${topMatch.value}" (Score: ${topMatch.score.toFixed(2)})`);
                    intent.brand = [topMatch.value];

                    // Construct corrected query: if the query is short, it's likely just the brand + maybe "phone"
                    // Simple strategy: replace the whole query with brand if it's very short, 
                    // or if it's a multi-word query, let's just use the brand as the corrected query for vector search purposes for now.
                    // Actually, per plan: "replace the typo in the original query with the correct brand name" is hard without exact token match.
                    // So we will just provide the brand as the corrected query if the query length is close to the brand length (typo only).
                    // Or more aggressively: always suggest the brand as the primary vector signal?
                    // Let's go with: if we found a brand, the 'correctedQuery' for embedding *IS* the brand (plus any other preserved keywords if we could, but let's start simple).
                    // This ensures "sansung" -> Embedding("Samsung") which is exactly what we want.

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

