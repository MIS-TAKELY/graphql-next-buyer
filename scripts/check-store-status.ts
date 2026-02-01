
import { PrismaClient } from '../app/generated/prisma';

const prisma = new PrismaClient();

async function main() {
    try {
        const stores = await prisma.sellerProfile.findMany({
            take: 5,
            select: { shopName: true, isActive: true }
        });
        console.log('Stores status:', JSON.stringify(stores, null, 2));
    } catch (error) {
        console.error('Error checking store status:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
