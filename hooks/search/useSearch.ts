import { MAKE_SEARCH_QUERY } from "@/client/search/search.query";
import { useQuery } from "@apollo/client";
import { useState, useEffect, useRef } from "react";

export const useSearch = (query?: string, filters?: any) => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [accumulatedProducts, setAccumulatedProducts] = useState<any[]>([]);
  const prevSearchCriteria = useRef({ query, filters });

  const {
    data: searchQueryResponse,
    loading: searchQueryLoading,
    error: searchQueryError,
  } = useQuery(MAKE_SEARCH_QUERY, {
    variables: {
      query: query,
      filters: filters,
      page: page,
      limit: limit,
    },
    fetchPolicy: "cache-first",
    notifyOnNetworkStatusChange: true,
  });

  // Handle reset when query or filters change
  useEffect(() => {
    const filtersChanged = JSON.stringify(prevSearchCriteria.current.filters) !== JSON.stringify(filters);
    const queryChanged = prevSearchCriteria.current.query !== query;

    if (filtersChanged || queryChanged) {
      setPage(1);
      setAccumulatedProducts([]);
      prevSearchCriteria.current = { query, filters };
    }
  }, [query, filters]);

  // Accumulate products when new data comes in
  useEffect(() => {
    if (searchQueryResponse?.searchProducts?.products) {
      const newProducts = searchQueryResponse.searchProducts.products;
      if (page === 1) {
        setAccumulatedProducts(newProducts);
      } else {
        setAccumulatedProducts(prev => {
          // Avoid duplicates if any (though pagination should prevent this)
          const existingIds = new Set(prev.map(p => p.id || p.slug));
          const uniqueNew = newProducts.filter((p: any) => !existingIds.has(p.id || p.slug));
          return [...prev, ...uniqueNew];
        });
      }
    }
  }, [searchQueryResponse, page]);

  if (searchQueryLoading && page === 1) console.log("loading first page-->");
  if (searchQueryError) console.log("error-->", searchQueryError);

  const totalResults = searchQueryResponse?.searchProducts?.pagination?.total || 0;
  const totalPages = searchQueryResponse?.searchProducts?.pagination?.totalPages || 1;

  return {
    searchProducts: accumulatedProducts,
    backendFilters: searchQueryResponse?.searchProducts?.filters,
    searchLoading: searchQueryLoading && page === 1,
    isFetchingMore: searchQueryLoading && page > 1,
    page,
    setPage,
    limit,
    setLimit,
    totalPages,
    totalResults,
  };
};
