import { prisma } from "../db/prisma";

interface SuggestedSpecification {
    key: string;
    label: string;
    type: string;
}

/**
 * Suggest relevant specifications based on search query
 * Uses Typesense to find similar products and extract their specs
 */
export async function suggestSpecifications(
    query: string
): Promise<SuggestedSpecification[]> {
    try {
        console.log(`🔍 Suggesting specifications for: "${query}"`);

        // Step 1: Find similar products using Typesense
        const { typesenseClient } = await import("../typesense");
        const searchResult = await typesenseClient.collections('products').documents().search({
            q: query,
            query_by: 'name,brand,description',
            per_page: 20,
            include_fields: 'id'
        });

        const hits = searchResult.hits || [];
        if (hits.length === 0) {
            console.log("⚠️ No similar products found in Typesense, using fallback");
            return getFallbackSpecifications(query);
        }

        // Step 2: Extract common specifications from similar products
        const productIds = hits.map((hit: any) => hit.document.id);

        const specCounts = await prisma.productSpecification.groupBy({
            by: ["key"],
            where: {
                variant: {
                    product: {
                        id: { in: productIds },
                        status: "ACTIVE",
                    },
                },
            },
            _count: true,
            orderBy: {
                _count: {
                    key: "desc",
                },
            },
            take: 10,
        });

        if (specCounts.length === 0) {
            console.log("⚠️ No specifications found, using fallback");
            return getFallbackSpecifications(query);
        }

        // Step 3: Convert to suggested specifications format
        const suggestions: SuggestedSpecification[] = specCounts.map((spec) => ({
            key: spec.key,
            label: formatLabel(spec.key),
            type: "dropdown",
        }));

        console.log(
            `✅ Suggested ${suggestions.length} specifications via Typesense`
        );
        return suggestions;
    } catch (error) {
        console.error("❌ Specification suggestion failed:", error);
        return getFallbackSpecifications(query);
    }
}

/**
 * Format specification key to human-readable label
 */
function formatLabel(key: string): string {
    return key
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}

/**
 * Fallback specifications for common product types
 */
export function getFallbackSpecifications(
    query: string
): SuggestedSpecification[] {
    const lowerQuery = query.toLowerCase();

    // Laptops
    if (lowerQuery.includes("laptop") || lowerQuery.includes("macbook")) {
        return [
            { key: "processor", label: "Processor", type: "dropdown" },
            { key: "ram", label: "RAM", type: "dropdown" },
            { key: "storage", label: "Storage", type: "dropdown" },
        ];
    }

    // Phones
    if (lowerQuery.includes("phone") || lowerQuery.includes("iphone")) {
        return [
            { key: "ram", label: "RAM", type: "dropdown" },
            { key: "storage", label: "Internal Storage", type: "dropdown" },
            { key: "battery_capacity", label: "Battery", type: "dropdown" },
        ];
    }

    return [];
}
