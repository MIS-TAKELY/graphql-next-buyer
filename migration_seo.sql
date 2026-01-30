-- Add SEO columns to products
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS "isIndexable" BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS "canonicalUrl" TEXT,
ADD COLUMN IF NOT EXISTS "lastIndexableUpdate" TIMESTAMP(3);

-- Add SEO columns to categories
ALTER TABLE categories 
ADD COLUMN IF NOT EXISTS "isIndexable" BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS "canonicalUrl" TEXT,
ADD COLUMN IF NOT EXISTS "lastIndexableUpdate" TIMESTAMP(3);

-- Add SEO columns to seller_profiles
ALTER TABLE seller_profiles 
ADD COLUMN IF NOT EXISTS "isIndexable" BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS "canonicalUrl" TEXT,
ADD COLUMN IF NOT EXISTS "lastIndexableUpdate" TIMESTAMP(3);

-- Create indexes for these new columns
CREATE INDEX IF NOT EXISTS idx_products_status_isindexable ON products(status, "isIndexable");
CREATE INDEX IF NOT EXISTS idx_categories_isactive_isindexable ON categories("isActive", "isIndexable");
CREATE INDEX IF NOT EXISTS idx_seller_profiles_isactive_isindexable ON seller_profiles("isActive", "isIndexable");
