#!/usr/bin/env tsx

/**
 * Re-index all products with normalized E5 embeddings
 * 
 * This script:
 * 1. Fetches all products with existing embeddings
 * 2. Re-generates embeddings with proper E5 'passage:' prefix
 * 3. Normalizes embeddings to unit length
 * 4. Updates database with new embeddings
 * 
 * Run with: npx tsx scripts/reindex-embeddings.ts
 */

import { prisma } from "../lib/db/prisma";
import { generateEmbedding } from "../lib/embemdind";
import { constructProductEmbeddingText } from "../lib/productUtils";

async function reindexAllProducts() {
    console.log("🚀 Starting product embedding re-indexing with E5 normalization...\n");

    // Fetch all products (or filter by those needing re-indexing)
    const products = await prisma.product.findMany({
        where: {
            status: 'ACTIVE',
        },
        include: {
            category: true,
            deliveryOptions: true,
            variants: {
                include: {
                    specifications: true,
                },
            },
        },
        orderBy: {
            createdAt: 'desc',
        },
    });

    if (products.length === 0) {
        console.log("✅ No products found to index!");
        return;
    }

    console.log(`📊 Found ${products.length} products to re-index\n`);

    let successCount = 0;
    let errorCount = 0;
    let skippedCount = 0;

    const startTime = Date.now();

    for (let i = 0; i < products.length; i++) {
        const product = products[i];
        const progress = `[${i + 1}/${products.length}]`;

        try {
            const text = constructProductEmbeddingText(product);

            if (!text || text.trim().length === 0) {
                console.warn(`${progress} ⚠️  Skipped ${product.name} (empty text)`);
                skippedCount++;
                continue;
            }

            // Generate embedding with 'passage' type and normalization
            const vector = await generateEmbedding(text, 'passage');

            if (vector.length !== 384) {
                console.error(`${progress} ❌ Invalid embedding dimension: ${vector.length} (expected 384)`);
                errorCount++;
                continue;
            }

            // Verify normalization (should be close to 1.0)
            const norm = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
            if (Math.abs(norm - 1.0) > 0.01) {
                console.warn(`${progress} ⚠️  Embedding not normalized: ${norm.toFixed(4)} (expected ~1.0)`);
            }

            const vectorString = `[${vector.join(",")}]`;

            await prisma.$executeRawUnsafe(`
        UPDATE "products"
        SET embedding = '${vectorString}'::vector
        WHERE id = '${product.id}'
      `);

            successCount++;

            // Log progress every 10 products
            if ((i + 1) % 10 === 0) {
                const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
                const rate = ((i + 1) / (Date.now() - startTime) * 1000).toFixed(1);
                console.log(`${progress} ✅ Progress: ${successCount} indexed, ${errorCount} errors, ${skippedCount} skipped (${rate} products/sec, ${elapsed}s elapsed)`);
            }
        } catch (error: any) {
            errorCount++;
            console.error(`${progress} ❌ Failed for ${product.name}:`, error.message || error);
        }
    }

    const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
    const avgRate = (successCount / (Date.now() - startTime) * 1000).toFixed(1);

    console.log("\n" + "=".repeat(60));
    console.log("📊 Re-indexing Complete!");
    console.log("=".repeat(60));
    console.log(`✅ Successfully indexed: ${successCount}`);
    console.log(`❌ Failed: ${errorCount}`);
    console.log(`⚠️  Skipped: ${skippedCount}`);
    console.log(`⏱️  Total time: ${totalTime}s`);
    console.log(`⚡ Average rate: ${avgRate} products/sec`);
    console.log("=".repeat(60) + "\n");
}

reindexAllProducts()
    .catch((e) => {
        console.error("💥 Script failed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
