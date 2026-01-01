import { prisma } from "../lib/db/prisma";
import { detectCategory } from "./detectCategory";

/**
 * Main logic: 
 * 1. Find a sample of products matching the search term to identify the "dominant" category.
 * 2. Walk up the category hierarchy to gather all eligible specifications.
 * 3. Populate options only from the products actually matching the search term.
 */
export async function getDynamicFilters(searchTerm: string) {
  // 1. Find products matching the query to identify their actual category assignments
  const sampleProducts = await prisma.product.findMany({
    where: {
      OR: [
        { name: { contains: searchTerm, mode: "insensitive" } },
        { brand: { contains: searchTerm, mode: "insensitive" } },
        { description: { contains: searchTerm, mode: "insensitive" } },
      ],
      status: "ACTIVE",
    },
    select: { categoryId: true },
    take: 10,
  });

  const catIds = new Set<string>();
  sampleProducts.forEach((p: any) => {
    if (p.categoryId) catIds.add(p.categoryId);
  });

  // 2. Also ask AI for the ideal category
  const detected = await detectCategory(searchTerm);
  const aiCategory = await prisma.category.findFirst({
    where: { name: { equals: detected, mode: "insensitive" } },
  });

  if (aiCategory) catIds.add(aiCategory.id);

  if (catIds.size === 0) {
    return { category: detected || "Unknown", filters: [] };
  }

  // 3. Gather specifications from all identified categories and their hierarchies
  const allSpecs: { key: string; label: string; options: any }[] = [];
  const seenKeys = new Set<string>();

  for (const startId of catIds) {
    let currentId: string | null = startId;
    while (currentId) {
      const specs = await prisma.categorySpecification.findMany({
        where: { categoryId: currentId },
        select: { key: true, label: true, options: true },
      });

      for (const s of specs) {
        if (!seenKeys.has(s.key)) {
          allSpecs.push(s);
          seenKeys.add(s.key);
        }
      }

      const cat = (await prisma.category.findUnique({
        where: { id: currentId },
        select: { parentId: true },
      })) as { parentId: string | null } | null;
      currentId = cat?.parentId || null;
    }
  }

  // 4. Populate options based on the search results
  const filtersWithPopulatedOptions = await Promise.all(
    allSpecs.map(async (s) => {
      let options: string[] = [];

      if (s.key === "brand") {
        const brands = await prisma.product.findMany({
          where: {
            OR: [
              { name: { contains: searchTerm, mode: "insensitive" } },
              { brand: { contains: searchTerm, mode: "insensitive" } },
            ],
            status: "ACTIVE",
          },
          distinct: ["brand"],
          select: { brand: true },
        });
        options = brands.map((b: any) => b.brand).filter(Boolean);
      } else {
        const specValues = await prisma.productSpecification.findMany({
          where: {
            key: s.key,
            variant: {
              product: {
                OR: [
                  { name: { contains: searchTerm, mode: "insensitive" } },
                  { brand: { contains: searchTerm, mode: "insensitive" } },
                ],
                status: "ACTIVE",
              },
            },
          },
          distinct: ["value"],
          select: { value: true },
        });
        options = specValues.map((v: any) => v.value).filter(Boolean);
      }

      return {
        label: s.label,
        key: s.key,
        options: options,
        type: "dropdown",
      };
    })
  );

  // 5. Return results
  return {
    category: aiCategory?.name || "Filtered Search",
    filters: filtersWithPopulatedOptions.filter((f) => f.options.length > 0),
  };
}

