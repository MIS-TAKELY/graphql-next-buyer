import { MAKE_SEARCH_QUERY } from "@/client/search/search.query";
import { useQuery } from "@apollo/client";


import { useState } from "react";

export const useSearch = (query?: string) => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);



  const {
    data: searchQueryResponse,
    loading: searchQueryLoading,
    error: searchQueryError,
  } = useQuery(MAKE_SEARCH_QUERY, {
    variables: {
      query: query,
      page: page,
      limit: limit,
    },
    fetchPolicy: "cache-first",
  });

  if (searchQueryLoading && page === 1) console.log("loading-->");
  if (searchQueryError) console.log("error-->", searchQueryError);

  const totalResults = searchQueryResponse?.searchProducts?.pagination?.total || 0;
  const totalPages = searchQueryResponse?.searchProducts?.pagination?.totalPages || 1;

  return {
    searchProducts: searchQueryResponse?.searchProducts.products,
    searchLoading: searchQueryLoading,
    page,
    setPage,
    limit,
    setLimit,
    totalPages,
    totalResults,
  };
};
