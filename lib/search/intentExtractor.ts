import axios from "axios";

const OPENROUTER_API_KEY =
    process.env.OPENROUTER_API_KEY ||
    "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";

/**
 * Extracted intent from user query
 * LLM outputs JSON only - NO database queries, NO filter invention
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
 * Key principles:
 * - LLM outputs JSON only
 * - No database queries from LLM
 * - Only extracts what's explicitly mentioned in query
 * - Fallback to empty intent on failure
 * 
 * @param query - User's search query (e.g., "iphone under 1 lakh with good camera")
 * @param availableFilters - List of valid filter keys from CategorySpecification
 * @returns Extracted intent with price, brand, and specifications
 * 
 * @example
 * ```typescript
 * const intent = await extractIntent(
 *   "iphone under 1 lakh with good camera",
 *   ["ram", "storage", "camera"]
 * );
 * // Returns: { price_max: 100000, brand: ["Apple"], specifications: { camera: "high" } }
 * ```
 */
export async function extractIntent(
    query: string,
    availableFilters: string[] = []
): Promise<ExtractedIntent> {
    const DEFAULT_INTENT: ExtractedIntent = {};

    try {
        const prompt = `You are an e-commerce search intent analyzer. Extract structured information from the user's query.

Available specification filters: ${availableFilters.join(", ")}

User Query: "${query}"

Extract ONLY what is explicitly mentioned in the query. Return a JSON object with these fields:
- price_max: Maximum price mentioned (convert "lakh" to 100000, "thousand" to 1000)
- price_min: Minimum price mentioned
- brand: Array of brand names mentioned (e.g., ["Apple"], ["Samsung", "OnePlus"])
- specifications: Object with key-value pairs for specs mentioned (ONLY use keys from available filters)

Rules:
1. If no price mentioned, omit price_max/price_min
2. If no brand mentioned, omit brand
3. For specifications, use ONLY keys from the available filters list
4. Convert qualitative terms: "good camera" → {"camera": "high"}, "fast" → {"performance": "high"}
5. Return empty object {} if nothing specific is mentioned

Examples:

Query: "iphone under 1 lakh"
Output: {"price_max": 100000, "brand": ["Apple"]}

Query: "samsung phone with 8gb ram"
Output: {"brand": ["Samsung"], "specifications": {"ram": "8GB"}}

Query: "laptop for gaming under 80000"
Output: {"price_max": 80000, "specifications": {"use_case": "gaming"}}

Query: "red shoes"
Output: {"specifications": {"color": "red"}}

Now analyze the user query and return ONLY the JSON object:`;

        const response = await axios.post(
            "https://openrouter.ai/api/v1/chat/completions",
            {
                model: "mistralai/mistral-7b-instruct",
                messages: [{ role: "user", content: prompt }],
                temperature: 0.1,
                max_tokens: 200,
                response_format: { type: "json_object" },
            },
            {
                headers: {
                    Authorization: `Bearer ${OPENROUTER_API_KEY}`,
                    "Content-Type": "application/json",
                },
                timeout: 5000, // 5 second timeout
            }
        );

        const content = response.data?.choices?.[0]?.message?.content || "{}";
        const parsed = JSON.parse(content);

        // Validate and sanitize the response
        const intent: ExtractedIntent = {};

        if (parsed.price_max && typeof parsed.price_max === "number") {
            intent.price_max = parsed.price_max;
        }

        if (parsed.price_min && typeof parsed.price_min === "number") {
            intent.price_min = parsed.price_min;
        }

        if (parsed.brand && Array.isArray(parsed.brand)) {
            intent.brand = parsed.brand.filter((b: string) => typeof b === "string");
        }

        if (parsed.specifications && typeof parsed.specifications === "object") {
            // Only include specs that are in availableFilters
            intent.specifications = {};
            Object.entries(parsed.specifications).forEach(([key, value]) => {
                if (
                    availableFilters.length === 0 ||
                    availableFilters.includes(key)
                ) {
                    intent.specifications![key] = String(value);
                }
            });
        }

        console.log("✅ Intent extracted:", intent);
        return intent;
    } catch (error: any) {
        console.error("❌ Intent extraction failed:", error.message || error);
        return DEFAULT_INTENT;
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
