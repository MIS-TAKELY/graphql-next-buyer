import { prisma } from "../../../../../lib/db/prisma";
// Actually in this project it seems to use `import "server-only";` or similar pattern in some places but let's check other resolvers.
// Checked previous file view: imports are like `import { ... } from "./..."`.
// I need to check where `prisma` is imported from in other resolvers.
// `buyer/servers/gql/index.ts` doesn't show prisma import.
// Lets check `buyer/servers/gql/modules/category/category.resolvers.ts` or similar to see pattern.
// But for now I will assume `@/lib/prisma` or similar. 
// Wait, I see `buyer/prisma/schema.prisma` output path is `../app/generated/prisma`.
// Let's check a resolver file first to be sure. 

// I will pause writing this file and first check an existing resolver to see how they import prisma.
// But I can't pause mid-tool-call group easily without extra turn.
// I will try to guess `@/lib/prisma` based on common patterns or `prisma` folder presence.
// `buyer/lib` has 54 files, likely has prisma.ts.
// Let's check `buyer/lib/prisma.ts` or similar in next step if I fail.
// Actually, I'll use `import { prisma } from "@/lib/prisma";` which is standard.

export const bannerResolvers = {
    Query: {
        getLandingPageBanners: async () => {
            return await prisma.landingPageBanner.findMany({
                orderBy: {
                    sortOrder: 'asc',
                },
            });
        },
        getLandingPageBanner: async (_: any, { id }: { id: string }) => {
            return await prisma.landingPageBanner.findUnique({
                where: { id },
            });
        },
    },
    Mutation: {
        createLandingPageBanner: async (_: any, { input }: { input: any }) => {
            try {
                // Get highest sortOrder to append to end
                const lastBanner = await prisma.landingPageBanner.findFirst({
                    orderBy: { sortOrder: 'desc' },
                });
                const newSortOrder = (lastBanner?.sortOrder ?? -1) + 1;

                const banner = await prisma.landingPageBanner.create({
                    data: {
                        ...input,
                        sortOrder: newSortOrder,
                    },
                });
                return {
                    success: true,
                    message: "Banner created successfully",
                    banner,
                };
            } catch (error: any) {
                return {
                    success: false,
                    message: error.message,
                };
            }
        },
        updateLandingPageBanner: async (_: any, { id, input }: { id: string; input: any }) => {
            try {
                const banner = await prisma.landingPageBanner.update({
                    where: { id },
                    data: input,
                });
                return {
                    success: true,
                    message: "Banner updated successfully",
                    banner,
                };
            } catch (error: any) {
                return {
                    success: false,
                    message: error.message,
                };
            }
        },
        deleteLandingPageBanner: async (_: any, { id }: { id: string }) => {
            try {
                await prisma.landingPageBanner.delete({
                    where: { id },
                });
                return {
                    success: true,
                    message: "Banner deleted successfully",
                };
            } catch (error: any) {
                return {
                    success: false,
                    message: error.message,
                };
            }
        },
        reorderLandingPageBanners: async (_: any, { ids }: { ids: string[] }) => {
            try {
                const updates = ids.map((id, index) =>
                    prisma.landingPageBanner.update({
                        where: { id },
                        data: { sortOrder: index },
                    })
                );
                await prisma.$transaction(updates);
                return {
                    success: true,
                    message: "Banners reordered successfully",
                };
            } catch (error: any) {
                return {
                    success: false,
                    message: error.message,
                };
            }
        },
    },
};
