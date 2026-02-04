
export function getProductUrl(product: { slug: string; id: string }) {
    // Format: /product/slug-pid
    return `/product/${product.slug}-p${product.id}`;
}

export function extractProductIdFromSlug(slug: string): string | null {
    // Expecting format: ...-p{id}
    // CUIDs are usually around 25 chars alphanumeric, but we can just take everything after the last -p

    const separator = '-p';
    const lastIndex = slug.lastIndexOf(separator);

    if (lastIndex === -1) {
        return null;
    }

    // Extract the part after -p
    const potentialId = slug.substring(lastIndex + separator.length);

    // Basic validation: ID should not be empty
    if (!potentialId) {
        return null;
    }

    return potentialId;
}

export function constructProductEmbeddingText(product: any): string {
    const parts: string[] = [];

    // Core info
    if (product.name) parts.push(product.name);
    if (product.brand) parts.push(product.brand);
    if (product.description) parts.push(product.description);
    if (product.category?.name) parts.push(product.category.name);

    // Features & Keywords
    if (Array.isArray(product.features)) parts.push(...product.features);
    if (Array.isArray(product.keywords)) parts.push(...product.keywords);

    // Delivery Options
    if (Array.isArray(product.deliveryOptions)) {
        product.deliveryOptions.forEach((opt: any) => {
            if (opt.title) parts.push(opt.title);
        });
    }

    // Variants & Specifications
    if (Array.isArray(product.variants)) {
        product.variants.forEach((variant: any) => {
            // Variant attributes (e.g. Color: Red)
            if (variant.attributes) {
                try {
                    const attrs = typeof variant.attributes === 'string' ? JSON.parse(variant.attributes) : variant.attributes;
                    Object.values(attrs).forEach((v: any) => parts.push(String(v)));
                } catch (e) { }
            }

            // Specifications
            if (Array.isArray(variant.specifications)) {
                variant.specifications.forEach((spec: any) => {
                    if (spec.key && spec.value) {
                        parts.push(`${spec.key} ${spec.value}`);
                    }
                });
            }
        });
    }

    // Top-level specification table (if any)
    if (product.specificationTable) {
        try {
            // Logic depends on structure, assuming straightforward values or key-value
            const specs = typeof product.specificationTable === 'string' ? JSON.parse(product.specificationTable) : product.specificationTable;
            // If array or object, try to extract unique string values
            const extract = (obj: any) => {
                if (typeof obj === 'string') parts.push(obj);
                else if (Array.isArray(obj)) obj.forEach(extract);
                else if (typeof obj === 'object' && obj !== null) Object.values(obj).forEach(extract);
            };
            extract(specs);
        } catch (e) { }
    }

    // Deduplicate and join
    const uniqueParts = Array.from(new Set(parts.map(p => p.trim()).filter(Boolean)));
    return uniqueParts.join(" ");
}
