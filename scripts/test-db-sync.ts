import 'dotenv/config';
import { prisma } from '../lib/db/prisma';

async function testFetch() {
    console.log("🚀 Testing database connection...");
    try {
        const count = await prisma.product.count({
            where: { status: 'ACTIVE' }
        });
        console.log(`✅ Success! Found ${count} active products.`);
    } catch (error) {
        console.error("❌ Database connection failed:", error);
    } finally {
        await prisma.$disconnect();
    }
}

testFetch();
