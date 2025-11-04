import { MAKE_SEARCH_QUERY } from "@/client/search/search.query";
import { useQuery } from "@apollo/client";

export const useSearch = (query?: string) => {
  const {
    data: searchQueryResponse,
    loading: searchQueryLoading,
    error: searchQueryError,
  } = useQuery(MAKE_SEARCH_QUERY, {
    variables: {
      query: query,
    },
    fetchPolicy: "cache-first",
  });

  if (searchQueryLoading) console.log("loading-->");
  if (searchQueryError) console.log("error-->", searchQueryError);

  return {
    searchProducts: searchQueryResponse?.searchProducts.products,
    searchLoading: searchQueryLoading,
  };
};
