import { prisma } from "../../../../lib/db/prisma";

export const seoPageResolvers = {
    Query: {
        seoPageByPath: async (_: any, { path }: { path: string }) => {
            // Ensure path starts with /
            const normalizedPath = path.startsWith('/') ? path : `/${path}`;

            return await prisma.seoPage.findUnique({
                where: { urlPath: normalizedPath },
                include: { category: true }
            });
        },
    },
    SeoPage: {
        structuredData: (page: any) => page.structuredData ? JSON.stringify(page.structuredData) : null,
        pinnedProductIds: (page: any) => page.pinnedProductIds || [],
        pinnedProducts: async (page: any) => {
            if (!page.pinnedProductIds || page.pinnedProductIds.length === 0) {
                return [];
            }
            // Fetch products preserving the order of pinnedProductIds
            const products = await prisma.product.findMany({
                where: { id: { in: page.pinnedProductIds }, status: 'ACTIVE' },
                include: {
                    seller: { select: { id: true, firstName: true, lastName: true } },
                    variants: {
                        select: {
                            id: true,
                            price: true,
                            mrp: true,
                            sku: true,
                            stock: true,
                            isDefault: true,
                            specifications: true,
                        }
                    },
                    images: { orderBy: [{ mediaType: 'asc' }, { sortOrder: 'asc' }] },
                    reviews: { select: { id: true, rating: true } },
                    category: { include: { parent: true } },
                    productOffers: { include: { offer: true } },
                }
            });

            // Map back to preserve order
            const productMap = new Map((products as any[]).map(p => [p.id, p]));
            return page.pinnedProductIds.map((id: string) => productMap.get(id)).filter(Boolean);
        }
    }
};
