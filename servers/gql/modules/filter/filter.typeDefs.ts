import gql from "graphql-tag";

export const filterTypeDefs = gql`
  type FilterOption {
    value: String!
    count: Int!
  }

  type Filter {
    label: String!
    key: String!
    type: String!
    options: [FilterOption!]!
  }

  type DynamicFilterResult {
    category: String!
    intent: Json
    filters: [Filter!]!
  }

  type Query {
    getDynamicFilters(searchTerm: String!): DynamicFilterResult!
  }
`;

