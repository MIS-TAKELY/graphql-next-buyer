import { generateEmbedding } from "../embemdind";
import { prisma } from "../db/prisma";

interface SuggestedSpecification {
    key: string;
    label: string;
    type: string;
}

/**
 * Suggest relevant specifications based on search query
 * Uses embedding similarity to find similar products and extract their specs
 * No external AI API required!
 */
export async function suggestSpecifications(
    query: string
): Promise<SuggestedSpecification[]> {
    try {
        console.log(`🔍 Suggesting specifications for: "${query}"`);

        // Step 1: Generate query embedding
        const queryEmbedding = await generateEmbedding(query);
        const vectorString = `[${queryEmbedding.join(",")}]`;

        // Step 2: Find similar products using vector search
        const similarProducts = await prisma.$queryRaw<
            Array<{ id: string; similarity: number }>
        >`
      SELECT 
        id::text,
        1 - (embedding <=> ${vectorString}::vector) AS similarity
      FROM "products"
      WHERE embedding IS NOT NULL AND status = 'ACTIVE'
      ORDER BY similarity DESC
      LIMIT 20
    `;

        if (similarProducts.length === 0) {
            console.log("⚠️ No similar products found, using fallback");
            return getFallbackSpecifications(query);
        }

        // Step 3: Extract common specifications from similar products
        const productIds = similarProducts.map((p) => p.id);

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

        // Step 4: Convert to suggested specifications format
        const suggestions: SuggestedSpecification[] = specCounts.map((spec) => ({
            key: spec.key,
            label: formatLabel(spec.key),
            type: "dropdown",
        }));

        console.log(
            `✅ Suggested ${suggestions.length} specifications via embedding similarity`
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
 * Used when embedding search fails or returns no results
 */
export function getFallbackSpecifications(
    query: string
): SuggestedSpecification[] {
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

    // Cameras & Photography
    if (
        lowerQuery.includes("camera") ||
        lowerQuery.includes("lens") ||
        lowerQuery.includes("photography")
    ) {
        return [
            { key: "megapixels", label: "Megapixels", type: "dropdown" },
            { key: "sensor_type", label: "Sensor Type", type: "dropdown" },
            { key: "lens_mount", label: "Lens Mount", type: "dropdown" },
            { key: "video_resolution", label: "Video Resolution", type: "dropdown" },
            { key: "iso_range", label: "ISO Range", type: "dropdown" },
        ];
    }

    // Storage (SSD, HDD, etc.)
    if (
        lowerQuery.includes("ssd") ||
        lowerQuery.includes("hdd") ||
        lowerQuery.includes("hard drive") ||
        lowerQuery.includes("storage")
    ) {
        return [
            { key: "capacity", label: "Capacity", type: "dropdown" },
            { key: "interface", label: "Interface", type: "dropdown" },
            { key: "form_factor", label: "Form Factor", type: "dropdown" },
            { key: "read_speed", label: "Read Speed", type: "dropdown" },
            { key: "write_speed", label: "Write Speed", type: "dropdown" },
        ];
    }

    // Clothing (Shirts, Dresses, Jeans, etc.)
    if (
        lowerQuery.includes("shirt") ||
        lowerQuery.includes("dress") ||
        lowerQuery.includes("jean") ||
        lowerQuery.includes("pant") ||
        lowerQuery.includes("trouser") ||
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
    console.log("📋 No fallback specifications matched");
    return [];
}

