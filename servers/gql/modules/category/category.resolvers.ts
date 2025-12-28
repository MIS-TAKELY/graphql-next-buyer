import { prisma } from "../../../../lib/db/prisma";
import { getCache, setCache } from "@/services/redis.services";

export const categoryResolvers = {
  Query: {
    categories: async () => {
      const cacheKey = "categories:all";
      const cached = await getCache<any[]>(cacheKey);

      if (cached) {
        return cached;
      }

      const categories = await prisma.category.findMany({
        where: { isActive: true },
        include: {
          children: {
            include: { children: true }
          },
          parent: true,
          categorySpecification: true
        },
        orderBy: { name: "asc" }
      });

      await setCache(cacheKey, categories, 3600); // 1 hour cache
      return categories;
    },
    category: async (_: any, { id }: { id: string }) => {
      if (!id) throw new Error("Category ID is required");

      const cacheKey = `category:${id}`;
      const cached = await getCache<any>(cacheKey);

      if (cached) {
        return cached;
      }

      const category = await prisma.category.findUnique({
        where: { id },
        include: {
          children: {
            include: { children: true }
          },
          parent: true,
          categorySpecification: true,
          products: {
            where: { status: "ACTIVE" },
            take: 10 // Limit products in category view to avoid huge payload
          }
        }
      });

      if (category) {
        await setCache(cacheKey, category, 3600);
      }

      return category;
    },
    categoryBySlug: async (_: any, { slug }: { slug: string }) => {
      if (!slug) throw new Error("Slug is required");

      const cacheKey = `category:slug:${slug}`;
      const cached = await getCache<any>(cacheKey);

      if (cached) {
        return cached;
      }

      const category = await prisma.category.findUnique({
        where: { slug, isActive: true },
        include: {
          children: {
            include: { children: true }
          },
          parent: true,
          categorySpecification: true,
          products: {
            where: { status: "ACTIVE" },
            take: 10
          }
        }
      });

      if (category) {
        await setCache(cacheKey, category, 3600);
      }

      return category;
    }
  },
  Mutation: {
    createCategory: async (_: any, { data }: { data: any }) => {
      // Basic implementation to satisfy typeDefs, though usually handled by Admin
      const category = await prisma.category.create({
        data: {
          ...data,
          slug: data.name.toLowerCase().replace(/ /g, '-'),
        }
      });
      return category;
    },
    createSubCategory: async (_: any, { data }: { data: any }) => {
      const category = await prisma.category.create({
        data: {
          ...data,
          slug: data.name.toLowerCase().replace(/ /g, '-'),
        }
      });
      return category;
    }
  }
};
