import { prisma } from "../../../../lib/db/prisma";

export const landingPageResolvers = {
    Query: {
        getLandingPageCategoryCards: async () => {
            const cards = await prisma.landingPageCategoryCard.findMany({
                where: { isActive: true },
                include: {
                    category: {
                        select: {
                            name: true,
                            _count: { select: { products: true } }
                        }
                    }
                },
                orderBy: { sortOrder: 'asc' }
            });

            return cards.map(card => ({
                id: card.id,
                categoryId: card.categoryId,
                categoryName: card.category.name,
                image: card.image,
                count: `${card.category._count.products}+ items`,
                color: card.color,
                darkColor: card.darkColor,
                sortOrder: card.sortOrder,
                isActive: card.isActive
            }));
        },

        getLandingPageCategorySwipers: async () => {
            const swipers = await prisma.landingPageCategorySwiper.findMany({
                where: { isActive: true },
                orderBy: { sortOrder: 'asc' }
            });

            return swipers;
        },

        getLandingPageProductGrids: async () => {
            const grids = await prisma.landingPageProductGrid.findMany({
                where: { isActive: true },
                orderBy: { sortOrder: 'asc' }
            });

            return grids;
        }
    }
};
