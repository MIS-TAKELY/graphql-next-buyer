import { prisma } from "../lib/db/prisma";
import { detectCategory } from "./detectCategory";

export interface FilterOption {
  value: string;
  label: string;
  count: number;
}

export interface FilterWithCount {
  key: string;
  label: string;
  type: string;
  options: FilterOption[];
}

export interface DynamicFilterResult {
  category: string;
  intent: Record<string, any>;
  filters: FilterWithCount[];
}

/**
 * Get dynamic filters with counts based on search term and applied filters
 * 
 * This implements the Amazon/Flipkart-style dynamic filtering:
 * 1. Find products matching search term (vector search results)
 * 2. Identify dominant category from results
 * 3. Walk up category hierarchy to gather all specifications
 * 4. Populate filter options with counts from actual data
 * 5. Update counts based on currently applied filters
 * 
 * @param searchTerm - User's search query
 * @param appliedFilters - Currently selected filters (for count updates)
 * @param productIds - Optional: Pre-filtered product IDs from vector search
 * @returns Dynamic filters with counts
 */
export async function getDynamicFilters(
  searchTerm: string,
  appliedFilters?: any,
  productIds?: string[]
): Promise<DynamicFilterResult> {

  // ===== STEP 1: Find matching products =====
  let matchingProductIds: string[] = productIds || [];

  if (!productIds || productIds.length === 0) {
    // Fallback to keyword search if no product IDs provided
    const sampleProducts = await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: searchTerm, mode: "insensitive" } },
          { brand: { contains: searchTerm, mode: "insensitive" } },
          { description: { contains: searchTerm, mode: "insensitive" } },
        ],
        status: "ACTIVE",
      },
      select: { id: true, categoryId: true },
      take: 100,
    });

    matchingProductIds = sampleProducts.map(p => p.id);
  }

  if (matchingProductIds.length === 0) {
    return {
      category: "Unknown",
      filters: [],
      intent: {},
    };
  }

  // ===== STEP 2: Identify dominant category =====
  const categoryDistribution = await prisma.product.groupBy({
    by: ["categoryId"],
    where: {
      id: { in: matchingProductIds },
      categoryId: { not: null },
    },
    _count: true,
    orderBy: {
      _count: {
        categoryId: "desc",
      },
    },
    take: 1,
  });

  const dominantCategoryId = categoryDistribution[0]?.categoryId;

  // Also get AI-suggested category
  const detected = await detectCategory(searchTerm);
  const aiCategory = await prisma.category.findFirst({
    where: { name: { equals: detected.category, mode: "insensitive" } },
  });

  const finalCategoryId = dominantCategoryId || aiCategory?.id;

  if (!finalCategoryId) {
    return {
      category: detected.category || "Unknown",
      filters: [],
      intent: detected.intent,
    };
  }

  // ===== STEP 3: Walk up category hierarchy to gather specs =====
  const allSpecs: { key: string; label: string; options: any }[] = [];
  const seenKeys = new Set<string>();

  // Always add brand filter first
  allSpecs.push({
    key: "brand",
    label: "Brand",
    options: null, // Will be populated from actual data
  });
  seenKeys.add("brand");

  let currentId: string | null = finalCategoryId;
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

    const cat: { parentId: string | null; name: string } | null = await prisma.category.findUnique({
      where: { id: currentId },
      select: { parentId: true, name: true },
    });

    currentId = cat?.parentId || null;
  }

  // ===== AI / Fallback Specifications =====
  // Always try to get relevant specifications from AI or fallback rules
  // This ensures we show filters like "Size", "Color" etc. even if not in DB CategorySpecification
  console.log(`🤖 Checking for AI/Fallback specifications for "${searchTerm}"`);

  const { suggestSpecifications, getFallbackSpecifications } = await import("@/lib/search/specificationSuggester");

  // Try AI first
  let suggestedSpecs = await suggestSpecifications(searchTerm);

  // Fallback to rule-based if AI fails
  if (suggestedSpecs.length === 0) {
    suggestedSpecs = getFallbackSpecifications(searchTerm);
    if (suggestedSpecs.length > 0) {
      console.log(`📋 Using ${suggestedSpecs.length} fallback specifications`);
    }
  }

  // Add suggested specs ONLY if they don't exist in DB specs (avoid duplicates)
  for (const spec of suggestedSpecs) {
    if (!seenKeys.has(spec.key)) {
      allSpecs.push({
        key: spec.key,
        label: spec.label,
        options: null, // Will be populated from actual data
      });
      seenKeys.add(spec.key);
    }
  }

  // ===== STEP 4: Build WHERE clause for applied filters (Faceted Search) =====
  /**
   * Builds the set of product IDs considering all applied filters EXCEPT the one we are currently calculating facets for.
   * This ensures that selecting one option in a category doesn't make other options in that SAME category disappear.
   */
  const buildFilteredProductIds = async (excludeKey?: string): Promise<string[]> => {
    if (!appliedFilters || Object.keys(appliedFilters).length === 0) {
      return matchingProductIds;
    }

    let filteredIds = matchingProductIds;

    // 1. Apply brand filter (only if not excluding brand facet)
    const brandFilter = appliedFilters.brands || (appliedFilters.specifications?.brand);
    if (excludeKey !== "brand" && brandFilter && brandFilter.length > 0) {
      const brandFiltered = await prisma.product.findMany({
        where: {
          id: { in: filteredIds },
          brand: { in: brandFilter },
        },
        select: { id: true },
      });
      filteredIds = brandFiltered.map((p) => p.id);
    }

    // 2. Apply category filter
    const categoryFilter = appliedFilters.categories;
    if (excludeKey !== "category" && categoryFilter && categoryFilter.length > 0) {
      const catFiltered = await prisma.product.findMany({
        where: {
          id: { in: filteredIds },
          category: { name: { in: categoryFilter } },
        },
        select: { id: true },
      });
      filteredIds = catFiltered.map((p) => p.id);
    }

    // 3. Apply price filter (always apply as price is usually a separate component, not a dynamic facet here)
    const minPrice = appliedFilters.minPrice || (appliedFilters.price_min?.[0] ? Number(appliedFilters.price_min[0]) : undefined);
    const maxPrice = appliedFilters.maxPrice || (appliedFilters.price_max?.[0] ? Number(appliedFilters.price_max[0]) : undefined);

    if (minPrice !== undefined || maxPrice !== undefined) {
      const priceFiltered = await prisma.product.findMany({
        where: {
          id: { in: filteredIds },
          variants: {
            some: {
              price: {
                ...(maxPrice !== undefined ? { lte: maxPrice } : {}),
                ...(minPrice !== undefined ? { gte: minPrice } : {}),
              },
            },
          },
        },
        select: { id: true },
      });
      filteredIds = priceFiltered.map((p) => p.id);
    }

    // 4. Apply specification filters
    const specFilters = appliedFilters.specifications || {};
    for (const [key, values] of Object.entries(specFilters)) {
      if (key === excludeKey || key === "brand" || key === "category") continue;

      if (Array.isArray(values) && values.length > 0) {
        const specFiltered = await prisma.product.findMany({
          where: {
            id: { in: filteredIds },
            variants: {
              some: {
                specifications: {
                  some: {
                    key,
                    value: { in: values },
                  },
                },
              },
            },
          },
          select: { id: true },
        });
        filteredIds = specFiltered.map((p) => p.id);
      }
    }

    return filteredIds;
  };

  // ===== STEP 5: Populate options with counts (Per-Facet) =====
  const filtersWithCounts = await Promise.all(
    allSpecs.map(async (s) => {
      // Calculate product IDs for this specific facet (ignoring its own selection)
      const facetFilteredIds = await buildFilteredProductIds(s.key);

      let options: FilterOption[] = [];

      if (s.key === "brand") {
        // Brand filter with counts
        const brands = await prisma.product.groupBy({
          by: ["brand"],
          where: {
            id: { in: facetFilteredIds },
            status: "ACTIVE",
          },
          _count: true,
        });

        options = brands
          .map((b) => ({
            value: b.brand,
            label: b.brand,
            count: b._count,
          }))
          .filter((opt) => opt.value)
          .sort((a, b) => b.count - a.count);
      } else {
        // Specification filter with counts
        const specCounts = await prisma.productSpecification.groupBy({
          by: ["value"],
          where: {
            key: s.key,
            variant: {
              product: {
                id: { in: facetFilteredIds },
                status: "ACTIVE",
              },
            },
          },
          _count: true,
        });

        options = specCounts
          .map((v) => ({
            value: v.value,
            label: v.value,
            count: v._count,
          }))
          .filter((opt) => opt.value)
          .sort((a, b) => b.count - a.count);
      }

      return {
        label: s.label,
        key: s.key,
        options,
        type: detected.attributes.includes(s.key) ? "suggested" : "dropdown",
      };
    })
  );

  // Get category name
  const category = await prisma.category.findUnique({
    where: { id: finalCategoryId },
    select: { name: true },
  });

  console.log(`🔍 Filter Debug for "${searchTerm}":`);
  console.log(`  - Category: ${category?.name}`);
  console.log(`  - Total specs collected: ${allSpecs.length}`);
  console.log(`  - Specs with options: ${filtersWithCounts.filter(f => f.options.length > 0).length}`);
  console.log(`  - Filter keys:`, allSpecs.map(s => s.key));

  // ===== STEP 6: Return results =====
  return {
    category: category?.name || detected.category || "Filtered Search",
    filters: filtersWithCounts.filter((f) => f.options.length > 0),
    intent: detected.intent,
  };
}
