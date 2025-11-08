import { prisma } from "@/lib/db/prisma";
import { getCache, setCache } from "@/services/redis.services";
import { cache } from "react";

export const getAllCategoryNames = cache(async () => {
  try {
    const cacheKey = "category:names";
    const cached = await getCache(cacheKey);

    if (cached) {
      console.log("⚡ Returning category names from Redis");
      return cached; // Already an array of strings
    }

    const categories = await prisma.category.findMany({
      where: {
        categorySpecification: {
          some: {},
        },
      },
      distinct: ["name"],
      select: { name: true },
      orderBy: { name: "asc" },
    });

    const categoryNames = categories.map((c) => c.name); // Extract strings first
    console.log("categoryNames",categoryNames)
    await setCache(cacheKey, categoryNames, 864000); // ✅ Cache strings

    return categoryNames;
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
});
getAllCategoryNames();
