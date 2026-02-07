const { Client } = require('pg');

async function sync() {
    console.log("🚀 Starting Typesense Sync (Native Fetch)...");

    const pgClient = new Client({
        connectionString: process.env.DATABASE_URL
    });

    try {
        await pgClient.connect();
        console.log("✅ Connected to DB");

        const res = await pgClient.query(`
            SELECT p.id, p.name, p.slug, p.description, p.brand, p.status, p. "soldCount", p. "averageRating", p. "createdAt",
                   c.name as "categoryName", c.id as "categoryId"
            FROM products p
            LEFT JOIN categories c ON p."categoryId" = c.id
            WHERE p.status = 'ACTIVE'
        `);

        const products = res.rows;
        console.log(`📦 Found ${products.length} products`);

        const documents = products.map(p => ({
            id: p.id,
            name: p.name,
            slug: p.slug,
            description: p.description || '',
            brand: p.brand,
            categoryName: p.categoryName || 'Uncategorized',
            categoryId: p.categoryId || '',
            price: 0,
            image: '',
            status: p.status,
            soldCount: p.soldCount,
            averageRating: Number(p.averageRating) || 0,
            createdAt: Math.floor(new Date(p.createdAt).getTime() / 1000),
            facet_attributes: []
        }));

        const typesenseUrl = `http://${process.env.TYPESENSE_HOST}:${process.env.TYPESENSE_PORT}/collections/products/documents/import?action=upsert`;

        const response = await fetch(typesenseUrl, {
            method: 'POST',
            body: documents.map(d => JSON.stringify(d)).join('\n'),
            headers: {
                'X-TYPESENSE-API-KEY': process.env.TYPESENSE_API_KEY,
                'Content-Type': 'text/plain'
            }
        });

        if (response.ok) {
            console.log("✅ Sync Complete!");
            const result = await response.text();
            console.log("Sync details:", result.substring(0, 100) + "...");
        } else {
            console.error("❌ Sync Failed:", response.status, await response.text());
        }
    } catch (err) {
        console.error("❌ Sync Error:", err);
    } finally {
        await pgClient.end();
    }
}

sync();
