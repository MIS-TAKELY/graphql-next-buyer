
import { PrismaClient } from '../app/generated/prisma';
const prisma = new PrismaClient();

async function debugRecommendations() {
    const slug = 'abstract-canvas-print';
    console.log(`Checking product: ${slug}`);

    // 1. Get Product ID
    const product = await prisma.product.findUnique({
        where: { slug },
        select: { id: true, name: true, status: true }
    });

    if (!product) {
        console.log('Product not found!');
        return;
    }
    console.log('Product found:', product);

    // 2. Check Embedding
    const embeddingResult = await prisma.$queryRaw`
    SELECT id, embedding::text 
    FROM "products" 
    WHERE id = ${product.id}
  `;
    const hasEmbedding = embeddingResult[0]?.embedding ? true : false;
    console.log(`Has embedding: ${hasEmbedding}`);

    // 3. Count Active Products
    const activeProducts = await prisma.product.count({
        where: { status: 'ACTIVE', id: { not: product.id } }
    });
    console.log(`Other Active Products count: ${activeProducts}`);

    // 4. Test "Fallback" Query
    if (!hasEmbedding) {
        console.log('Simulating Fallback Query...');
        const fallback = await prisma.product.findMany({
            where: {
                status: 'ACTIVE',
                id: { not: product.id },
            },
            take: 10,
            select: { id: true, name: true }
        });
        console.log('Fallback results:', fallback);
    }

    // 5. Test "Vector" Query (if embedding exists)
    if (hasEmbedding) {
        console.log('Simulating Vector Query...');
        // Note: we can't easily reproduce the vector query raw string exactly without fetching the embedding string first, 
        // but we can check if there are ANY other products with embeddings.
        const productsWithEmbeddings = await prisma.$queryRaw`
        SELECT count(*)::int as count FROM "products" WHERE embedding IS NOT NULL AND id != ${product.id}
     `;
        console.log('Other products with embeddings:', productsWithEmbeddings);
    }
}

debugRecommendations()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
