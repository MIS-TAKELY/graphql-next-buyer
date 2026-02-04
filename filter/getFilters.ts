import { prisma } from "../lib/db/prisma";
import { typesenseClient } from "../lib/typesense";
import { extractIntentWithLLM } from "@/lib/search/intentExtractor";

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
 * Get dynamic filters with counts using Typesense and LLM
 */
export async function getDynamicFilters(
  searchTerm: string,
  appliedFilters?: any
): Promise<DynamicFilterResult> {
  console.log(`🚀 Getting dynamic filters for: "${searchTerm}"`);
  const startTime = Date.now();

  try {
    // 1. Extract Intent using LLM
    const intent = await extractIntentWithLLM(searchTerm);
    console.log(`🤖 LLM Intent extracted in ${Date.now() - startTime}ms`);

    // 2. Build Typesense Query
    const query = intent.correctedQuery || searchTerm;

    // Construct filter_by for Typesense
    const filters: string[] = ['status:=ACTIVE'];

    if (intent.category) {
      filters.push(`categoryName:="${intent.category}"`);
    }
    if (intent.brand && intent.brand.length > 0) {
      filters.push(`brand:=[${intent.brand.map(b => `"${b}"`).join(',')}]`);
    }
    if (intent.price_min !== undefined) {
      filters.push(`price:>=${intent.price_min}`);
    }
    if (intent.price_max !== undefined) {
      filters.push(`price:<=${intent.price_max}`);
    }

    // Apply front-end selected filters if any
    if (appliedFilters) {
      if (appliedFilters.brands && appliedFilters.brands.length > 0) {
        filters.push(`brand:=[${appliedFilters.brands.map((b: string) => `"${b}"`).join(',')}]`);
      }
      if (appliedFilters.categories && appliedFilters.categories.length > 0) {
        filters.push(`categoryName:=[${appliedFilters.categories.map((c: string) => `"${c}"`).join(',')}]`);
      }
      // specifications are in facet_attributes: "Key:Value"
      if (appliedFilters.specifications) {
        Object.entries(appliedFilters.specifications).forEach(([key, values]: [string, any]) => {
          if (Array.isArray(values) && values.length > 0) {
            const specFilters = values.map(v => `facet_attributes:="${key}:${v}"`).join(' || ');
            filters.push(`(${specFilters})`);
          }
        });
      }
    }

    // 3. Search Typesense with Faceting
    let searchResult = await typesenseClient.collections('products').documents().search({
      q: query,
      query_by: 'name,brand,description,categoryName',
      filter_by: filters.join(' && '),
      facet_by: 'brand,categoryName,facet_attributes',
      max_facet_values: 50,
      per_page: 0,
    });

    // If no results found with category filter, try without it
    if (searchResult.found === 0 && intent.category) {
      console.log("⚠️ No results with category filter, retrying without it...");
      const broaderFilters = filters.filter(f => !f.startsWith('categoryName:'));
      searchResult = await typesenseClient.collections('products').documents().search({
        q: query,
        query_by: 'name,brand,description,categoryName',
        filter_by: broaderFilters.join(' && '),
        facet_by: 'brand,categoryName,facet_attributes',
        max_facet_values: 50,
        per_page: 0,
      });
    }

    console.log(`⚡ Typesense search completed in ${Date.now() - startTime}ms (Found: ${searchResult.found})`);

    // 4. Transform Typesense Facets to DynamicFilterResult
    const dynamicFilters: FilterWithCount[] = [];

    // Map brand facets
    const brandFacet = searchResult.facet_counts?.find(f => f.field_name === 'brand');
    if (brandFacet && brandFacet.counts.length > 0) {
      dynamicFilters.push({
        key: 'brand',
        label: 'Brand',
        type: 'dropdown',
        options: brandFacet.counts.map(c => ({
          value: c.value,
          label: c.value,
          count: c.count
        }))
      });
    }

    // Map dynamic specification facets (from facet_attributes)
    const attrFacet = searchResult.facet_counts?.find(f => f.field_name === 'facet_attributes');
    if (attrFacet) {
      const specGroups: Record<string, FilterOption[]> = {};

      attrFacet.counts.forEach(c => {
        const [key, ...valueParts] = c.value.split(':');
        const value = valueParts.join(':');

        if (!specGroups[key]) specGroups[key] = [];
        specGroups[key].push({
          value: value,
          label: value,
          count: c.count
        });
      });

      // Convert groups to FilterWithCount
      Object.entries(specGroups).forEach(([key, options]) => {
        // Find label from DB or capitalize key
        dynamicFilters.push({
          key: key,
          label: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' '),
          type: 'dropdown',
          options: options.sort((a, b) => b.count - a.count)
        });
      });
    }

    // 5. Categorize and Return
    const detectedCategory = intent.category || (searchResult.facet_counts?.find(f => f.field_name === 'categoryName')?.counts[0]?.value) || "Unknown";

    return {
      category: detectedCategory,
      intent: intent as any,
      filters: dynamicFilters,
    };

  } catch (error) {
    console.error("❌ Optimized dynamic filter failed:", error);
    // Fallback? For now just return empty or error
    return {
      category: "Search Results",
      intent: {},
      filters: [],
    };
  }
}
