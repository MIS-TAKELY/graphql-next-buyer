import 'dotenv/config';
import { prisma } from '../lib/db/prisma';
import { typesenseClient, PRODUCT_SCHEMA } from '../lib/typesense';

async function indexTypesense() {
    console.log("🚀 Starting Typesense indexing...");

    // 1. Ensure Collection Exists
    let exists = false;
    try {
        await typesenseClient.collections('products').retrieve();
        exists = true;
    } catch (e) { }

    if (exists) {
        console.log("✅ Collection 'products' found. Deleting for clean re-index...");
        await typesenseClient.collections('products').delete();
    }

    console.log("🚀 Creating collection 'products'...");
    await typesenseClient.collections().create(PRODUCT_SCHEMA);
    console.log("✅ Collection 'products' created.");

    // 2. Fetch Products
    const products = await prisma.product.findMany({
        where: { status: 'ACTIVE' },
        include: {
            category: true,
            variants: {
                where: { isDefault: true },
                include: {
                    specifications: true
                },
                take: 1
            },
            images: {
                orderBy: [{ mediaType: 'asc' }, { sortOrder: 'asc' }],
                take: 1
            }
        }
    });

    console.log(`📦 Found ${products.length} products to index.`);

    if (products.length === 0) return;

    // 3. Transform Data
    const documents = products.map(p => {
        const defaultVariant = p.variants[0];
        const price = defaultVariant ? Number(defaultVariant.price) : 0;

        return {
            id: p.id,
            name: p.name,
            slug: p.slug,
            description: p.description || '',
            brand: p.brand,
            categoryName: p.category?.name || 'Uncategorized',
            categoryId: p.category?.id || '',
            price: price,
            image: p.images[0]?.url || '',
            status: p.status,
            soldCount: p.soldCount,
            averageRating: Number(p.averageRating) || 0,
            createdAt: Math.floor(p.createdAt.getTime() / 1000), // Unix timestamp
            facet_attributes: defaultVariant?.specifications.map(s => `${s.key}:${s.value}`) || [],
        };
    });

    // 4. Bulk Import
    try {
        const results = await typesenseClient.collections('products').documents().import(documents, { action: 'upsert' });

        // Check for errors
        const failedItems = results.filter((r: any) => r.success === false);
        if (failedItems.length > 0) {
            console.error(`❌ Failed to index ${failedItems.length} items.`);
            console.error(JSON.stringify(failedItems[0], null, 2));
        } else {
            console.log(`✅ Successfully indexed ${documents.length} documents.`);
        }

    } catch (error) {
        console.error("❌ Indexing failed:", error);
    }
}

indexTypesense()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
