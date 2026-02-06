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
    }
};
