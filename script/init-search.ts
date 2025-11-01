import { PrismaClient } from "@/app/generated/prisma";
import { openSearchIndexService } from "@/services/opensearch-index.services";
import { productIndexingService } from "@/services/product-indexing.services";


const prisma = new PrismaClient();

async function initializeSearch() { 
  try {
    console.log('Initializing search index...');
    
    // Delete existing index if it exists
    await openSearchIndexService.deleteIndex();
    
    // Create new index
    await openSearchIndexService.createProductIndex();
    
    console.log('Index created successfully');
    
    // Check if we have products to index
    const productCount = await prisma.product.count({
      where: { status: 'ACTIVE' }
    });
    
    if (productCount === 0) {
      console.log('No active products found to index');
      process.exit(0);
    }
    
    console.log(`Found ${productCount} active products to index`);
    
    // Index products in batches
    console.log('Starting product indexing...');
    let offset = 0;
    const batchSize = 50;
    let totalIndexed = 0;
    
    while (offset < productCount) {
      const result = await productIndexingService.bulkIndexProducts(batchSize, offset);
      totalIndexed += result.indexed;
      console.log(`Indexed ${result.indexed} products (total: ${totalIndexed}/${productCount})`);
      
      if (result.errors) {
        console.warn('Some products had indexing errors');
      }
      
      offset += batchSize;
    }
    
    console.log(`Search initialization complete! Indexed ${totalIndexed} products.`);
    process.exit(0);
  } catch (error) {
    console.error('Failed to initialize search:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

initializeSearch();