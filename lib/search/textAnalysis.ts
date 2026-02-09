/**
 * Text Analysis Utilities
 * Regex-based extraction for price, numbers, and common patterns
 * No external AI API required
 */

export interface PriceRange {
    min?: number;
    max?: number;
}

/**
 * Extract price range from natural language query
 * Handles Nepali currency terms (lakh, thousand, etc.)
 */
export function extractPriceRange(query: string): PriceRange {
    const lowerQuery = query.toLowerCase();
    const result: PriceRange = {};

    // Price patterns
    const patterns = {
        // "under 1 lakh", "below 100000", "less than 50k"
        max: [
            /(?:under|below|less than|max|maximum|upto|up to)\s*(?:rs\.?\s*)?(\d+(?:,\d+)*)\s*(lakh|thousand|k)?/i,
            /(?:under|below|less than)\s*(\d+(?:,\d+)*)\s*(lakh|thousand|k)?/i,
        ],
        // "above 50000", "more than 1 lakh", "minimum 20k"
        min: [
            /(?:above|over|more than|min|minimum|from)\s*(?:rs\.?\s*)?(\d+(?:,\d+)*)\s*(lakh|thousand|k)?/i,
            /(?:above|over|more than)\s*(\d+(?:,\d+)*)\s*(lakh|thousand|k)?/i,
        ],
        // "between 50000 and 100000", "50k to 1 lakh"
        range: [
            /(?:between|from)\s*(?:rs\.?\s*)?(\d+(?:,\d+)*)\s*(lakh|thousand|k)?\s*(?:to|and|-)\s*(?:rs\.?\s*)?(\d+(?:,\d+)*)\s*(lakh|thousand|k)?/i,
        ],
    };

    // Helper to convert number with unit to actual value
    const parseNumber = (num: string, unit?: string): number => {
        const cleanNum = parseFloat(num.replace(/,/g, ""));
        if (!unit) return cleanNum;

        const unitLower = unit.toLowerCase();
        if (unitLower === "lakh" || unitLower === "lac") return cleanNum * 100000;
        if (unitLower === "thousand" || unitLower === "k") return cleanNum * 1000;
        return cleanNum;
    };

    // Check for range pattern first
    for (const pattern of patterns.range) {
        const match = lowerQuery.match(pattern);
        if (match) {
            result.min = parseNumber(match[1], match[2]);
            result.max = parseNumber(match[3], match[4]);
            return result;
        }
    }

    // Check for max price
    for (const pattern of patterns.max) {
        const match = lowerQuery.match(pattern);
        if (match) {
            result.max = parseNumber(match[1], match[2]);
            break;
        }
    }

    // Check for min price
    for (const pattern of patterns.min) {
        const match = lowerQuery.match(pattern);
        if (match) {
            result.min = parseNumber(match[1], match[2]);
            break;
        }
    }

    return result;
}

/**
 * Extract brand names from query using keyword matching
 * Returns array of potential brand names
 */
export function extractBrandKeywords(query: string): string[] {
    const lowerQuery = query.toLowerCase();
    const brands: string[] = [];

    // Common brand patterns (can be extended)
    const brandKeywords = [
        "apple",
        "samsung",
        "oneplus",
        "xiaomi",
        "redmi",
        "realme",
        "oppo",
        "vivo",
        "nokia",
        "motorola",
        "sony",
        "lg",
        "dell",
        "hp",
        "lenovo",
        "asus",
        "acer",
        "msi",
        "razer",
        "microsoft",
        "google",
        "huawei",
        "honor",
        "nothing",
        "iqoo",
        "poco",
        "infinix",
        "tecno",
        "canon",
        "nikon",
        "fujifilm",
        "gopro",
        "dji",
        "bose",
        "jbl",
        "boat",
        "nike",
        "adidas",
        "puma",
    ];

    for (const brand of brandKeywords) {
        if (lowerQuery.includes(brand)) {
            // Capitalize first letter
            brands.push(brand.charAt(0).toUpperCase() + brand.slice(1));
        }
    }

    return brands;
}

/**
 * Extract specifications from query using keyword matching
 */
export function extractSpecificationKeywords(
    query: string
): Record<string, string> {
    const lowerQuery = query.toLowerCase();
    const specs: Record<string, string> = {};

    // RAM patterns
    const ramMatch = lowerQuery.match(/(\d+)\s*gb\s*ram/i);
    if (ramMatch) {
        specs.ram = `${ramMatch[1]}GB`;
    }

    // Storage patterns
    const storageMatch = lowerQuery.match(/(\d+)\s*(gb|tb)\s*(?:storage|ssd|hdd)/i);
    if (storageMatch) {
        specs.storage = `${storageMatch[1]}${storageMatch[2].toUpperCase()}`;
    }

    // Color patterns
    const colorKeywords = [
        "red",
        "blue",
        "green",
        "black",
        "white",
        "silver",
        "gold",
        "gray",
        "grey",
        "pink",
        "purple",
        "yellow",
        "orange",
    ];
    for (const color of colorKeywords) {
        const regex = new RegExp(`\\b${color}\\b`, "i");
        if (regex.test(lowerQuery)) {
            specs.color = color.charAt(0).toUpperCase() + color.slice(1);
            break;
        }
    }

    // Size patterns (for clothing, shoes)
    const sizeMatch = lowerQuery.match(/\b(xs|s|m|l|xl|xxl|xxxl)\b/i);
    if (sizeMatch) {
        specs.size = sizeMatch[1].toUpperCase();
    }

    // Display size patterns
    const displayMatch = lowerQuery.match(/(\d+(?:\.\d+)?)\s*(?:inch|")/i);
    if (displayMatch) {
        specs.display_size = `${displayMatch[1]} inch`;
    }

    // Processor patterns
    if (lowerQuery.includes("i3")) specs.processor = "Intel Core i3";
    if (lowerQuery.includes("i5")) specs.processor = "Intel Core i5";
    if (lowerQuery.includes("i7")) specs.processor = "Intel Core i7";
    if (lowerQuery.includes("i9")) specs.processor = "Intel Core i9";
    if (lowerQuery.includes("ryzen 3")) specs.processor = "AMD Ryzen 3";
    if (lowerQuery.includes("ryzen 5")) specs.processor = "AMD Ryzen 5";
    if (lowerQuery.includes("ryzen 7")) specs.processor = "AMD Ryzen 7";
    if (lowerQuery.includes("ryzen 9")) specs.processor = "AMD Ryzen 9";

    // Qualitative attributes
    if (
        lowerQuery.includes("gaming") ||
        lowerQuery.includes("gamer") ||
        lowerQuery.includes("game")
    ) {
        specs.use_case = "gaming";
    }

    if (
        lowerQuery.includes("professional") ||
        lowerQuery.includes("work") ||
        lowerQuery.includes("business")
    ) {
        specs.use_case = "professional";
    }

    return specs;
}

/**
 * Detect quality/price qualifiers
 */
export function detectQualifiers(query: string): {
    quality: "budget" | "mid-range" | "premium" | null;
    urgency: boolean;
} {
    const lowerQuery = query.toLowerCase();

    let quality: "budget" | "mid-range" | "premium" | null = null;

    // Budget indicators
    if (
        lowerQuery.includes("cheap") ||
        lowerQuery.includes("budget") ||
        lowerQuery.includes("affordable") ||
        lowerQuery.includes("economical")
    ) {
        quality = "budget";
    }

    // Premium indicators
    if (
        lowerQuery.includes("premium") ||
        lowerQuery.includes("luxury") ||
        lowerQuery.includes("high-end") ||
        lowerQuery.includes("flagship") ||
        lowerQuery.includes("best")
    ) {
        quality = "premium";
    }

    // Mid-range indicators
    if (
        lowerQuery.includes("mid-range") ||
        lowerQuery.includes("mid range") ||
        lowerQuery.includes("moderate")
    ) {
        quality = "mid-range";
    }

    // Urgency indicators
    const urgency =
        lowerQuery.includes("urgent") ||
        lowerQuery.includes("asap") ||
        lowerQuery.includes("immediately") ||
        lowerQuery.includes("now");

    return { quality, urgency };
}

/**
 * Complete text analysis - combines all extraction methods
 */
export function analyzeQuery(query: string) {
    return {
        priceRange: extractPriceRange(query),
        brands: extractBrandKeywords(query),
        specifications: extractSpecificationKeywords(query),
        qualifiers: detectQualifiers(query),
    };
}
