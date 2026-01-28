-- Migration: Add indexes for dynamic search performance
-- This migration adds critical indexes for:
-- 1. Vector search (pgvector IVFFlat)
-- 2. Price filtering
-- 3. Specification filtering
-- 4. Business ranking metrics

-- ============================================
-- 1. Vector Search Index (IVFFlat)
-- ============================================
-- This index dramatically improves vector similarity search performance
-- lists=100 is optimal for datasets with 10k-100k products
-- Adjust lists based on your dataset size:
--   - 10k products: lists=50
--   - 100k products: lists=100
--   - 1M products: lists=1000

CREATE INDEX IF NOT EXISTS idx_products_embedding 
ON products USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- ============================================
-- 2. Price Filtering Index
-- ============================================
-- Speeds up price range queries on variants

CREATE INDEX IF NOT EXISTS idx_product_variants_price 
ON product_variants (price);

-- ============================================
-- 3. Specification Filtering Indexes
-- ============================================
-- Critical for dynamic filter queries

CREATE INDEX IF NOT EXISTS idx_product_specifications_key 
ON product_specifications (key);

CREATE INDEX IF NOT EXISTS idx_product_specifications_key_value 
ON product_specifications (key, value);

-- ============================================
-- 4. Category Hierarchy Index
-- ============================================
-- For walking up category tree to get parent specs

CREATE INDEX IF NOT EXISTS idx_categories_parent 
ON categories ("parentId");

-- ============================================
-- 5. Business Ranking Indexes
-- ============================================
-- For final ranking step (popularity + trust)

CREATE INDEX IF NOT EXISTS idx_products_sold_rating 
ON products ("soldCount" DESC, "averageRating" DESC);

-- ============================================
-- 6. Product Status & Category Index
-- ============================================
-- For filtering active products by category

CREATE INDEX IF NOT EXISTS idx_products_status_category 
ON products (status, "categoryId") 
WHERE status = 'ACTIVE';

-- ============================================
-- 7. Variant Product Relationship Index
-- ============================================
-- For joining variants to products efficiently

CREATE INDEX IF NOT EXISTS idx_product_variants_product 
ON product_variants ("productId");

-- ============================================
-- 8. Delivery Options Index
-- ============================================
-- For delivery filter aggregation

CREATE INDEX IF NOT EXISTS idx_delivery_options_product 
ON delivery_options ("productId");

-- ============================================
-- Analyze tables for query planner
-- ============================================
ANALYZE products;
ANALYZE product_variants;
ANALYZE product_specifications;
ANALYZE categories;
ANALYZE delivery_options;
