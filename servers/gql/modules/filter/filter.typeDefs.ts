import gql from "graphql-tag";

export const filterTypeDefs = gql`
  type Filter {
    label: String!
    key: String!
    type: String!
    options: Json
  }

  type DynamicFilterResult {
    category: String!
    filters: [Filter!]!
  }

  type Query {
    getDynamicFilters(searchTerm: String!): DynamicFilterResult!
  }
`;
