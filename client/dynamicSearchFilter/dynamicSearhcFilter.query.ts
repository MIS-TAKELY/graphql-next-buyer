import gql from "graphql-tag";

export const GET_DYNAMIC_SEARCH_FILTER = gql`
  query GetDynamicFilters($searchTerm: String!) {
    getDynamicFilters(searchTerm: $searchTerm) {
      category
      intent
      filters {
        key
        label
        options
        type
      }
    }
  }
`;
