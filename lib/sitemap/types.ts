export interface SitemapUrl {
  loc: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

export interface SitemapIndexEntry {
  loc: string;
  lastmod?: string;
}

export interface ProductForSitemap {
  id: string;
  slug: string;
  status: string;
  isIndexable: boolean;
  canonicalUrl: string | null;
  lastIndexableUpdate: Date | null;
  updatedAt: Date;
  soldCount: number;
  variants: {
    stock: number;
  }[];
}

export interface CategoryForSitemap {
  slug: string;
  isActive: boolean;
  isIndexable: boolean;
  canonicalUrl: string | null;
  lastIndexableUpdate: Date | null;
  updatedAt: Date;
}

export interface SellerProfileForSitemap {
  slug: string;
  isActive: boolean;
  isIndexable: boolean;
  verificationStatus: string;
  canonicalUrl: string | null;
  lastIndexableUpdate: Date | null;
  updatedAt: Date;
}