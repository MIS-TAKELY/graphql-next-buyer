import { GET_DYNAMIC_SEARCH_FILTER } from "@/client/dynamicSearchFilter/dynamicSearhcFilter.query";
import { useQuery } from "@apollo/client";


export interface Filter {
  key: string;
  label: string;
  options: string[];
}

export interface DynamicFilterResult {
  category: string;
  intent?: Record<string, string[]>;
  filters: Filter[];
}

export const useDynamicSearchFilter = (searchTerm: string) => {
  const {
    data: dynamicSearchFilterResponse,
    loading: dynamicSearchFilterLoading,
    error: dynamicSearchFilterError,
  } = useQuery(GET_DYNAMIC_SEARCH_FILTER, {
    variables: {
      searchTerm,
    },
    skip: !searchTerm || searchTerm.trim().length === 0,
    fetchPolicy: "cache-first",
    nextFetchPolicy: "cache-first",
  });

  return {
    dynamicSearchData: dynamicSearchFilterResponse?.getDynamicFilters,
    dynamicSearchFilterLoading,
  };
};
