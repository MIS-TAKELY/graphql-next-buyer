import { GET_DYNAMIC_SEARCH_FILTER } from "@/client/dynamicSearchFilter/dynamicSearhcFilter.query";
import { useQuery } from "@apollo/client";
import { useState, useEffect } from "react";


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
  // Debounce search term to reduce API calls
  const [debouncedTerm, setDebouncedTerm] = useState(searchTerm);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTerm(searchTerm);
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const {
    data: dynamicSearchFilterResponse,
    loading: dynamicSearchFilterLoading,
    error: dynamicSearchFilterError,
  } = useQuery(GET_DYNAMIC_SEARCH_FILTER, {
    variables: {
      searchTerm: debouncedTerm,
    },
    skip: !debouncedTerm, // Skip query if search term is empty
    fetchPolicy: 'cache-and-network', // Show cached data immediately, fetch fresh in background
    nextFetchPolicy: 'cache-first', // Use cache for subsequent requests
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
