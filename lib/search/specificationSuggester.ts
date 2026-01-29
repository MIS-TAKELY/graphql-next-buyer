import axios from "axios";

interface SuggestedSpecification {
    key: string;
    label: string;
    type: string;
}

/**
 * Use AI to suggest relevant specifications based on search query
 * when category has no specifications defined
 */
export async function suggestSpecifications(
    query: string
): Promise<SuggestedSpecification[]> {
    const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

    if (!OPENROUTER_API_KEY) {
        console.warn("⚠️ OPENROUTER_API_KEY not set, skipping AI spec suggestion");
        return [];
    }

    const prompt = `You are a product specification expert. Based on the search query, suggest relevant product specifications that users would want to filter by.

Search Query: "${query}"

Return ONLY a JSON array of specifications. Each specification should have:
- key: lowercase_snake_case identifier
- label: Human-readable label
- type: "dropdown" or "range"

Common specifications by product type:
- Laptops/PCs: processor, ram, storage, graphics, display_size, operating_system, battery_life
- Phones: ram, storage, camera, battery_capacity, display_size, processor, operating_system
- Watches: display_type, water_resistance, band_material, movement_type
- Clothing: size, color, material, fit
- Furniture: material, dimensions, color, weight_capacity

Return 5-8 most relevant specifications. Output ONLY valid JSON array, no explanation.

Example output:
[
  {"key": "ram", "label": "RAM", "type": "dropdown"},
  {"key": "storage", "label": "Storage", "type": "dropdown"},
  {"key": "processor", "label": "Processor", "type": "dropdown"}
]`;

    try {
        const response = await axios.post(
            "https://openrouter.ai/api/v1/chat/completions",
            {
                model: "mistralai/mistral-7b-instruct",
                messages: [
                    {
                        role: "user",
                        content: prompt,
                    },
                ],
                temperature: 0.3,
                max_tokens: 500,
            },
            {
                headers: {
                    Authorization: `Bearer ${OPENROUTER_API_KEY}`,
                    "Content-Type": "application/json",
                },
                timeout: 5000,
            }
        );

        const content = response.data.choices[0]?.message?.content?.trim();
        if (!content) {
            return [];
        }

        // Extract JSON from response (handle markdown code blocks)
        let jsonStr = content;
        const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        if (jsonMatch) {
            jsonStr = jsonMatch[1];
        }

        const suggestions = JSON.parse(jsonStr);

        if (!Array.isArray(suggestions)) {
            console.warn("⚠️ AI returned non-array for spec suggestions");
            return [];
        }

        // Validate structure
        const validSuggestions = suggestions.filter(
            (s) =>
                s.key &&
                typeof s.key === "string" &&
                s.label &&
                typeof s.label === "string" &&
                s.type &&
                (s.type === "dropdown" || s.type === "range")
        );

        console.log(`✅ AI suggested ${validSuggestions.length} specifications for "${query}"`);
        return validSuggestions;
    } catch (error) {
        console.error("❌ AI spec suggestion failed:", error);
        return [];
    }
}

/**
 * Fallback specifications for common product types
 * Used when AI is unavailable
 */
export function getFallbackSpecifications(query: string): SuggestedSpecification[] {
    const lowerQuery = query.toLowerCase();

    // Laptops/Computers
    if (
        lowerQuery.includes("laptop") ||
        lowerQuery.includes("computer") ||
        lowerQuery.includes("pc") ||
        lowerQuery.includes("macbook")
    ) {
        return [
            { key: "processor", label: "Processor", type: "dropdown" },
            { key: "ram", label: "RAM", type: "dropdown" },
            { key: "storage", label: "Storage", type: "dropdown" },
            { key: "graphics", label: "Graphics Card", type: "dropdown" },
            { key: "display_size", label: "Display Size", type: "dropdown" },
            { key: "operating_system", label: "Operating System", type: "dropdown" },
        ];
    }

    // Phones
    if (
        lowerQuery.includes("phone") ||
        lowerQuery.includes("mobile") ||
        lowerQuery.includes("smartphone") ||
        lowerQuery.includes("iphone") ||
        lowerQuery.includes("samsung")
    ) {
        return [
            { key: "ram", label: "RAM", type: "dropdown" },
            { key: "storage", label: "Internal Storage", type: "dropdown" },
            { key: "rear_camera", label: "Rear Camera", type: "dropdown" },
            { key: "battery_capacity", label: "Battery", type: "dropdown" },
            { key: "display_size", label: "Display Size", type: "dropdown" },
            { key: "processor", label: "Processor", type: "dropdown" },
        ];
    }

    // Watches
    if (lowerQuery.includes("watch")) {
        return [
            { key: "display_type", label: "Display Type", type: "dropdown" },
            { key: "water_resistance", label: "Water Resistance", type: "dropdown" },
            { key: "band_material", label: "Band Material", type: "dropdown" },
            { key: "movement_type", label: "Movement Type", type: "dropdown" },
        ];
    }

    // Tablets
    if (lowerQuery.includes("tablet") || lowerQuery.includes("ipad")) {
        return [
            { key: "ram", label: "RAM", type: "dropdown" },
            { key: "storage", label: "Storage", type: "dropdown" },
            { key: "display_size", label: "Display Size", type: "dropdown" },
            { key: "operating_system", label: "Operating System", type: "dropdown" },
        ];
    }

    // TVs
    if (lowerQuery.includes("tv") || lowerQuery.includes("television")) {
        return [
            { key: "screen_size", label: "Screen Size", type: "dropdown" },
            { key: "resolution", label: "Resolution", type: "dropdown" },
            { key: "display_type", label: "Display Type", type: "dropdown" },
            { key: "smart_tv", label: "Smart TV", type: "dropdown" },
        ];
    }

    // Clothing (Shirts, Dresses, Jeans, etc.)
    if (
        lowerQuery.includes("shirt") ||
        lowerQuery.includes("dress") ||
        lowerQuery.includes("jean") ||
        lowerQuery.includes("pant") ||
        lowerQuery.includes("tround") ||
        lowerQuery.includes("clothing") ||
        lowerQuery.includes("shoe") ||
        lowerQuery.includes("sneaker")
    ) {
        return [
            { key: "size", label: "Size", type: "dropdown" },
            { key: "color", label: "Color", type: "dropdown" },
            { key: "material", label: "Material", type: "dropdown" },
            { key: "fit", label: "Fit", type: "dropdown" },
            { key: "brand", label: "Brand", type: "dropdown" },
        ];
    }

    // Default: return empty (rely on category specs)
    return [];
}
