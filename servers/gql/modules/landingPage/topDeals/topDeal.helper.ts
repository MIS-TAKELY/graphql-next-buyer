import { Category, Prisma } from "../../../../../app/generated/prisma";
import { prisma } from "../../../../../lib/db/prisma";
import { CategoryWithId } from "@/types/topDeals";

// Helper function to get top-level parent category
export async function getTopLevelParentCategory(
  categoryId: string
): Promise<Pick<Category, "id" | "name" | "parentId"> | null> {
  let currentCategory = await prisma.category.findUnique({
    where: { id: categoryId },
    select: {
      id: true,
      name: true,
      parentId: true,
    },
  });

  if (!currentCategory) {
    return null;
  }

  // Traverse up the hierarchy until we find a category with no parent
  let maxDepth = 10; // Prevent infinite loops
  while (currentCategory && currentCategory.parentId && maxDepth > 0) {
    const parent: any = await prisma.category.findUnique({
      where: { id: currentCategory.parentId },
      select: {
        id: true,
        name: true,
        parentId: true,
      },
    });

    if (!parent) {
      break;
    }

    currentCategory = parent;
    maxDepth--;
  }

  return currentCategory;
}

// Helper function to get all descendant category IDs (including the parent itself)
export async function getAllDescendantCategoryIds(
  categoryId: string
): Promise<string[]> {
  const categories = await prisma.$queryRaw<CategoryWithId[]>(
    Prisma.sql`
      WITH RECURSIVE category_tree AS (
        -- Base case: start with the given category
        SELECT id
        FROM categories
        WHERE id = ${categoryId}
        
        UNION ALL
        
        -- Recursive case: get child categories
        SELECT c.id
        FROM categories c
        INNER JOIN category_tree ct ON c."parentId" = ct.id
      )
      SELECT id::text
      FROM category_tree
    `
  );

  return categories.map((c) => c.id);
}
