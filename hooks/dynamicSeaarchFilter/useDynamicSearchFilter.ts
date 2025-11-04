import { GET_DYNAMIC_SEARCH_FILTER } from "@/client/dynamicSearchFilter/dynamicSearhcFilter.query";
import { useQuery } from "@apollo/client";


export interface Filter {
  key: string;
  label: string;
  options: string[];
}

export interface DynamicFilterResult {
  category: string;
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
  });

  console.log(
    "dynamicSearchFilterResponse-->",
    dynamicSearchFilterResponse?.getDynamicFilters
  );

  return {
    dynamicSearchData: dynamicSearchFilterResponse?.getDynamicFilters,
    dynamicSearchFilterLoading,
  };
};
