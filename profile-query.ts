import { PrismaClient } from "./app/generated/prisma";

const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
});

async function profileQuery() {
    console.log("Starting profiling...");

    // Warm up the DB
    console.log("Warming up database...");
    for (let i = 0; i < 5; i++) {
        try {
            await prisma.$queryRaw`SELECT 1`;
            console.log("Database is awake!");
            break;
        } catch (e: any) {
            console.warn(`Warm-up attempt ${i + 1} failed: ${e.message}`);
            await new Promise(resolve => setTimeout(resolve, 3000));
        }
    }

    // Attempt to find a slug first
    let slug = "dffhg"; // From logs
    try {
        const firstProduct = await prisma.product.findFirst({ select: { slug: true } });
        if (firstProduct) slug = firstProduct.slug;
    } catch (e: any) {
        console.warn("Could not fetch a dynamic slug, using fallback:", slug);
    }

    console.log(`Profiling for slug: ${slug}`);

    const segments = [
        { name: "Base Product", include: {} },
        { name: "With Seller", include: { seller: true } },
        { name: "With Variants", include: { variants: true } },
        { name: "With Images", include: { images: true } },
        { name: "With Category", include: { category: true } },
        { name: "With Reviews", include: { reviews: true } },
        {
            name: "Full Include", include: {
                seller: { select: { id: true, firstName: true, lastName: true } },
                variants: {
                    select: {
                        id: true,
                        price: true,
                        stock: true,
                        isDefault: true,
                        mrp: true,
                        attributes: true,
                        specifications: true,
                    },
                },
                deliveryOptions: true,
                images: true,
                reviews: {
                    select: {
                        id: true,
                        rating: true,
                        comment: true,
                        createdAt: true,
                        user: { select: { id: true, firstName: true, lastName: true } },
                        media: true,
                    },
                },
                category: {
                    select: {
                        id: true,
                        name: true,
                        parent: { select: { id: true, name: true } },
                    },
                },
                productOffers: {
                    include: {
                        offer: true,
                    },
                },
            }
        }
    ];

    for (const segment of segments) {
        const start = Date.now();
        try {
            await prisma.product.findUnique({
                where: { slug },
                include: segment.include as any
            });
            console.log(`[PROFILE] ${segment.name}: ${Date.now() - start}ms`);
        } catch (e: any) {
            console.error(`[PROFILE] ${segment.name} FAILED:`, e.message);
        }
    }

    await prisma.$disconnect();
}

profileQuery().catch(console.error);
