import { APP_URL } from '@/config/env';

/**
 * Normalizes a URL by removing query parameters, fragments, and tracking params
 */
export function normalizeUrl(url: string): string {
  try {
    const urlObj = new URL(url, APP_URL);
    
    // Remove query parameters entirely
    urlObj.search = '';
    
    // Remove fragment
    urlObj.hash = '';
    
    // Ensure lowercase path
    urlObj.pathname = urlObj.pathname.toLowerCase();
    
    // Remove trailing slash (except for root)
    if (urlObj.pathname !== '/' && urlObj.pathname.endsWith('/')) {
      urlObj.pathname = urlObj.pathname.slice(0, -1);
    }
    
    return urlObj.toString();
  } catch (error) {
    console.error('Error normalizing URL:', url, error);
    return url;
  }
}

/**
 * Generates canonical product URL
 */
export function generateProductUrl(slug: string, canonicalUrl?: string | null): string {
  if (canonicalUrl) {
    return normalizeUrl(canonicalUrl);
  }
  
  // Sanitize slug
  const cleanSlug = sanitizeSlug(slug);
  if (!cleanSlug) {
    throw new Error(`Invalid product slug: ${slug}`);
  }
  
  return normalizeUrl(`${APP_URL}/product/${encodeURIComponent(cleanSlug)}`);
}

/**
 * Generates canonical category URL (no filters, no pagination)
 */
export function generateCategoryUrl(slug: string, canonicalUrl?: string | null): string {
  if (canonicalUrl) {
    return normalizeUrl(canonicalUrl);
  }
  
  const cleanSlug = sanitizeSlug(slug);
  if (!cleanSlug) {
    throw new Error(`Invalid category slug: ${slug}`);
  }
  
  return normalizeUrl(`${APP_URL}/category/${encodeURIComponent(cleanSlug)}`);
}

/**
 * Generates canonical store URL
 */
export function generateStoreUrl(slug: string, canonicalUrl?: string | null): string {
  if (canonicalUrl) {
    return normalizeUrl(canonicalUrl);
  }
  
  const cleanSlug = sanitizeSlug(slug);
  if (!cleanSlug) {
    throw new Error(`Invalid store slug: ${slug}`);
  }
  
  return normalizeUrl(`${APP_URL}/store/${encodeURIComponent(cleanSlug)}`);
}

/**
 * Sanitizes slug for URL usage
 */
export function sanitizeSlug(slug: string | null | undefined): string | null {
  if (!slug) return null;
  
  const cleaned = slug
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[&<>"']/g, '')
    .replace(/[^\w\-]/g, '');
  
  return cleaned || null;
}

/**
 * Formats date for sitemap lastmod
 */
export function formatLastMod(date: Date | null | undefined): string | undefined {
  if (!date) return undefined;
  
  try {
    // W3C Datetime format (YYYY-MM-DD)
    return new Date(date).toISOString().split('T')[0];
  } catch (error) {
    console.error('Error formatting date:', date, error);
    return undefined;
  }
}