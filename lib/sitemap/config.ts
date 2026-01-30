export const SITEMAP_CONFIG = {
  // Partition settings
  MAX_URLS_PER_SITEMAP: 50000,
  MAX_SITEMAP_SIZE_BYTES: 50 * 1024 * 1024, // 50MB
  
  // Cache settings
  REVALIDATE_SECONDS: 3600, // 1 hour
  
  // URL priorities
  PRIORITIES: {
    homepage: 1.0,
    topProducts: 0.9,
    highSellingProducts: 0.8,
    regularProducts: 0.7,
    categories: 0.7,
    stores: 0.6,
    staticPages: {
      about: 0.8,
      contact: 0.8,
      help: 0.6,
      policies: 0.3,
    },
  },
  
  // Change frequencies
  CHANGE_FREQ: {
    homepage: 'daily' as const,
    products: 'daily' as const,
    categories: 'weekly' as const,
    stores: 'weekly' as const,
    staticPages: 'monthly' as const,
  },
  
  // Product filtering thresholds
  HIGH_SELLING_THRESHOLD: 100, // soldCount >= 100
  TOP_PRODUCTS_THRESHOLD: 50, // Top 50 products by soldCount
} as const;