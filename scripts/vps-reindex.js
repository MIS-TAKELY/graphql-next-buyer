const { Client } = require('pg');

async function sync() {
    console.log("🚀 Starting Standalone Typesense Sync...");

    const pgClient = new Client({
        connectionString: process.env.DATABASE_URL
    });

    try {
        await pgClient.connect();
        console.log("✅ Connected to DB");

        // Fetch products with their category and default variant specs
        // We also fetch the specificationTable JSON from products
        const query = `
            SELECT 
                p.id, p.name, p.slug, p.description, p.brand, p.status, p."soldCount", p."averageRating", p."createdAt",
                p."specificationTable",
                c.name as "categoryName", c.id as "categoryId",
                v.price,
                array_agg(ps.key || ':' || ps.value) FILTER (WHERE ps.key IS NOT NULL) as specs
            FROM products p
            LEFT JOIN categories c ON p."categoryId" = c.id
            LEFT JOIN product_variants v ON p.id = v."productId" AND (v."isDefault" = true OR v.id = (
                SELECT id FROM product_variants WHERE "productId" = p.id LIMIT 1
            ))
            LEFT JOIN product_specifications ps ON v.id = ps."variantId"
            WHERE p.status = 'ACTIVE'
            GROUP BY p.id, c.name, c.id, v.price
        `;

        const res = await pgClient.query(query);
        const products = res.rows;
        console.log(`📦 Found ${products.length} products to index`);

        const documents = products.map(p => {
            let facet_attributes = p.specs || [];

            // Add specs from specificationTable JSON if available
            if (p.specificationTable && Array.isArray(p.specificationTable)) {
                p.specificationTable.forEach(section => {
                    if (section.rows && Array.isArray(section.rows)) {
                        section.rows.forEach(row => {
                            if (Array.isArray(row) && row.length >= 2) {
                                facet_attributes.push(`${row[0]}:${row[1]}`);
                            }
                        });
                    }
                });
            }

            return {
                id: p.id,
                name: p.name,
                slug: p.slug,
                description: p.description || '',
                brand: p.brand,
                categoryName: p.categoryName || 'Uncategorized',
                categoryId: p.categoryId || '',
                price: Number(p.price) || 0,
                image: '', // We could fetch this too but it's secondary for filters
                status: p.status,
                soldCount: p.soldCount,
                averageRating: Number(p.averageRating) || 0,
                createdAt: Math.floor(new Date(p.createdAt).getTime() / 1000),
                facet_attributes: Array.from(new Set(facet_attributes))
            };
        });

        const typesenseUrl = `http://${process.env.TYPESENSE_HOST}:${process.env.TYPESENSE_PORT}/collections/products/documents/import?action=upsert`;

        console.log(`📤 Syncing ${documents.length} documents to Typesense...`);
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
            console.log("Sync result summary:", result.substring(0, 100) + "...");
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
