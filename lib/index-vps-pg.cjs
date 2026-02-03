
const { Client } = require('pg');

const client = new Client({
    connectionString: process.env.DATABASE_URL,
});

const EMBEDDING_API_URL = "http://172.18.0.1:8000/embed";

async function main() {
    await client.connect();
    console.log("Connected to DB");

    // Check if we need to clear first (User asked to remove all and re-embed, but I already cleared via psql command earlier?)
    // The user said "remove all teh embedding and reenbeed it".
    // I ran a clear command in step 303 (via local script through tunnel, wait, step 303 was local script).
    // Step 306 output "Cleared".
    // So theoretically it is empty. But I should check count first.

    const resKey = await client.query('SELECT count(*) as count FROM products WHERE embedding IS NOT NULL');
    console.log(`Current indexed count: ${resKey.rows[0].count}`);

    const res = await client.query('SELECT id, name, description, brand FROM products WHERE embedding IS NULL');
    const products = res.rows;
    console.log(`Found ${products.length} unindexed products.`);

    if (products.length === 0) return;

    for (const product of products) {
        const text = `${product.name} ${product.description || ""} ${product.brand}`.trim();
        if (!text) continue;

        try {
            const resp = await fetch(EMBEDDING_API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ texts: [text] })
            });

            if (!resp.ok) throw new Error(`API Error: ${resp.statusText}`);

            const data = await resp.json();
            const vector = data.embeddings[0];

            if (vector.length !== 384) {
                console.warn(`Mismatch dimension: ${vector.length}`);
                continue;
            }

            const vectorString = `[${vector.join(",")}]`;

            await client.query('UPDATE products SET embedding = $1::vector WHERE id = $2', [vectorString, product.id]);
            console.log(`Indexed: ${product.name}`);
        } catch (err) {
            console.error(`Failed ${product.id}:`, err.message);
        }
    }
}

main().catch(console.error).finally(() => client.end());
