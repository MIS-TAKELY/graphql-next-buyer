
import { PrismaClient } from "./app/generated/prisma/index.js";
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import dotenv from 'dotenv';

dotenv.config();

async function main() {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const adapter = new PrismaPg(pool);
    const prisma = new PrismaClient({ adapter });

    console.log("Testing User.findFirst()...");
    try {
        const user = await prisma.user.findFirst();
        console.log("User success:", !!user);
    } catch (e) {
        console.error("User failed:", e);
    }

    console.log("\nTesting Product.findMany()...");
    try {
        const products = await prisma.product.findMany({ take: 1 });
        console.log("Product success:", products.length);
    } catch (e) {
        console.error("Product failed:", e);
    }

    await prisma.$disconnect();
}

main();
