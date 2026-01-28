-- Add soldCount and averageRating columns to products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS "soldCount" INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS "averageRating" DECIMAL(3,2) DEFAULT 0;

-- Create indexes for search performance
CREATE INDEX IF NOT EXISTS idx_products_embedding 
ON products USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

CREATE INDEX IF NOT EXISTS idx_product_variants_price 
ON product_variants (price);

CREATE INDEX IF NOT EXISTS idx_product_specifications_key 
ON product_specifications (key);

CREATE INDEX IF NOT EXISTS idx_product_specifications_key_value 
ON product_specifications (key, value);

CREATE INDEX IF NOT EXISTS idx_categories_parent 
ON categories ("parentId");

CREATE INDEX IF NOT EXISTS idx_products_sold_rating 
ON products ("soldCount" DESC, "averageRating" DESC);

CREATE INDEX IF NOT EXISTS idx_products_status_category 
ON products (status, "categoryId") 
WHERE status = 'ACTIVE';

CREATE INDEX IF NOT EXISTS idx_product_variants_product 
ON product_variants ("productId");

CREATE INDEX IF NOT EXISTS idx_delivery_options_product 
ON delivery_options ("productId");

-- Analyze tables
ANALYZE products;
ANALYZE product_variants;
ANALYZE product_specifications;
ANALYZE categories;
ANALYZE delivery_options;
