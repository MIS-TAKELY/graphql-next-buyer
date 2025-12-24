
import "dotenv/config";
import { prisma } from "./lib/db/prisma";

async function debug() {
    const products = await prisma.product.findMany({
        where: { status: "ACTIVE" },
        take: 5,
        include: {
            variants: {
                select: {
                    id: true,
                    price: true,
                    mrp: true,
                    isDefault: true
                }
            }
        }
    });

    console.log(JSON.stringify(products, null, 2));
}

debug().catch(console.error).finally(() => prisma.$disconnect());
