import 'dotenv/config';
import pg from 'pg';
const { Client } = pg;

async function checkSchema() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        await client.connect();
        const res = await client.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'products' AND column_name = 'embedding'
        `);
        console.log("Column 'embedding' in 'products':", res.rows);

        const extRes = await client.query(`
            SELECT extname FROM pg_extension WHERE extname = 'vector'
        `);
        console.log("Vector extension:", extRes.rows);
    } catch (err) {
        console.error("Error checking schema:", err);
    } finally {
        await client.end();
    }
}

checkSchema();
