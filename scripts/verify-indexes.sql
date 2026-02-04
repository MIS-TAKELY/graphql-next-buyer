-- Verify that all indexes were created successfully
SELECT 
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes 
WHERE tablename IN ('products', 'product_variants', 'product_specifications', 'categories')
  AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;
