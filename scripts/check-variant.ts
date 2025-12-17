
import { PrismaClient } from '../app/generated/prisma';

const prisma = new PrismaClient();

async function main() {
    const variantId = process.argv[2];
    if (!variantId) {
        console.error("Please provide a variant ID");
        process.exit(1);
    }

    console.log(`Checking for variant: ${variantId}`);
    const variant = await prisma.productVariant.findUnique({
        where: { id: variantId },
        include: { product: true }
    });

    if (variant) {
        console.log("Variant found:", variant);
    } else {
        console.log("Variant NOT found");
        // List all variants to see what's there
        const allVariants = await prisma.productVariant.findMany({ take: 5 });
        console.log("Sample of existing variants:", allVariants.map(v => v.id));
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
