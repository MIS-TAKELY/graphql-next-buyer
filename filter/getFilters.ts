import { prisma } from "@/lib/db/prisma";
import { detectCategory } from "./detectCategory";

/**
 * Main logic: Detect category via AI → Fetch related filters from DB
 */
export async function getDynamicFilters(searchTerm: string) {
  // 1. Try matching a category from the DB directly
  // let category = await prisma.category.findFirst({
  //   where: { name: { contains: searchTerm, mode: "insensitive" } },
  // });

  let category;

  // 2. If no match, ask the AI
  if (!category) {
    const detected = await detectCategory(searchTerm);

    console.log("detected-->", detected);
    category = await prisma.category.findFirst({
      where: { name: { equals: detected, mode: "insensitive" } },
    });
  }
  console.log("category-->", category);

  if (!category) {
    return { category: "Unknown", filters: [] };
  }

  // 3. Fetch filterable specifications for that category
  const specs = await prisma.categorySpecification.findMany({
    where: { categoryId: category.id },
    select: { key: true, label: true, options: true },
  });

  // console.log("specs--->", specs);
  const data = {
    category: category.name,
    filters: specs.map((s) => ({
      label: s.label,
      key: s.key,
      options: s.options,
      type: "dropdown", // you can decide dynamically later
    })),
  };

  console.log("data-->", data);
  // 4. Return frontend-friendly structure
  return {
    category: category.name,
    filters: specs.map((s) => ({
      label: s.label,
      key: s.key,
      options: s.options,
      type: "dropdown", // you can decide dynamically later
    })),
  };
}

