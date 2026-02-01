
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const storeSlug = 'all-in-one-store';
    console.log(`Checking status for store: ${storeSlug}`);

    const profile = await prisma.sellerProfile.findUnique({
        where: { slug: storeSlug }
    });

    if (!profile) {
        console.log('Store not found by slug.');
        // Try finding by similar slug?
        const similar = await prisma.sellerProfile.findFirst({
            where: { slug: { contains: 'all' } }
        });
        console.log('Similar store found:', similar);
    } else {
        console.log('Store found:');
        console.log(`ID: ${profile.id}`);
        console.log(`Is Active: ${profile.isActive}`);
        console.log(`Verification Status: ${profile.verificationStatus}`);
        console.log(`Shop Name: ${profile.shopName}`);
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
