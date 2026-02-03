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
            // Try embedding-based brand detection
            try {
                const queryEmbedding = await generateEmbedding(query);
                const brandEmbeddings = await getBrandEmbeddings();

                if (brandEmbeddings.length > 0) {
                    const similarBrands = findTopSimilar(queryEmbedding, brandEmbeddings, 3, 0.6);
                    if (similarBrands.length > 0) {
                        intent.brand = similarBrands.map(b => b.name);
                        console.log(`🎯 Brands detected via embedding: ${intent.brand.join(", ")}`);
                    }
                }
            } catch (error) {
                console.error("❌ Embedding-based brand detection failed:", error);
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

