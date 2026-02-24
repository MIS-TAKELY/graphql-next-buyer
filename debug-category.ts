import { prisma } from "./lib/db/prisma";

async function main() {
    const product = await prisma.product.findFirst({
        where: { name: { contains: "Sony ZV-1 II" } },
        select: {
            id: true,
            name: true,
            category: {
                select: {
                    id: true,
                    name: true,
                    parentId: true
                }
            }
        }
    });

    console.log("--- Product Info ---");
    console.log(JSON.stringify(product, null, 2));

    const smartphonesCat = await prisma.category.findFirst({
        where: { name: { equals: "Smart phones", mode: "insensitive" } },
        select: {
            id: true,
            name: true,
            parentId: true
        }
    });

    console.log("\n--- Smartphones Category Info ---");
    console.log(JSON.stringify(smartphonesCat, null, 2));

    if (smartphonesCat) {
        const descendants = await prisma.$queryRaw`
      WITH RECURSIVE category_tree AS (
        SELECT id FROM categories WHERE id = ${smartphonesCat.id}
        UNION ALL
        SELECT c.id FROM categories c INNER JOIN category_tree ct ON c."parentId" = ct.id
      )
      SELECT id FROM category_tree;
    `;
        console.log("\n--- Smartphones Descendants ---");
        console.log(JSON.stringify(descendants, null, 2));
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
