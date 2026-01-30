import { ProductForSitemap } from './types';

/**
 * Determines if a product should be included in sitemap
 */
export function isProductIndexable(product: ProductForSitemap): boolean {
  // Must be explicitly marked as indexable
  if (!product.isIndexable) {
    return false;
  }
  
  // Must be ACTIVE status
  if (product.status !== 'ACTIVE') {
    return false;
  }
  
  // Must have at least one variant with stock OR have sales history
  const hasStock = product.variants.some(v => v.stock > 0);
  const hasSalesHistory = product.soldCount > 0;
  
  if (!hasStock && !hasSalesHistory) {
    return false;
  }
  
  // Must have valid slug
  if (!product.slug || product.slug.trim() === '') {
    return false;
  }
  
  return true;
}

/**
 * Determines if a category should be included in sitemap
 */
export function isCategoryIndexable(category: {
  isActive: boolean;
  isIndexable: boolean;
  slug: string;
}): boolean {
  return (
    category.isIndexable &&
    category.isActive &&
    !!category.slug &&
    category.slug.trim() !== ''
  );
}

/**
 * Determines if a seller profile should be included in sitemap
 */
export function isSellerProfileIndexable(profile: {
  isActive: boolean;
  isIndexable: boolean;
  verificationStatus: string;
  slug: string;
}): boolean {
  return (
    profile.isIndexable &&
    profile.isActive &&
    profile.verificationStatus === 'APPROVED' &&
    !!profile.slug &&
    profile.slug.trim() !== ''
  );
}

/**
 * Calculates priority for product based on sales
 */
export function calculateProductPriority(soldCount: number, baselinePriority: number): number {
  if (soldCount >= 100) {
    return Math.min(0.9, baselinePriority + 0.2);
  } else if (soldCount >= 50) {
    return Math.min(0.8, baselinePriority + 0.1);
  }
  return baselinePriority;
}