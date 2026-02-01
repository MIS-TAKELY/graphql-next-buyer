
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
