import { gql } from "graphql-tag";

export const seoPageTypeDefs = gql`
  type SeoPage {
    id: ID!
    urlPath: String!
    categoryId: String!
    priceThreshold: Int
    metaTitle: String
    metaDescription: String
    structuredData: JSON
    lastGeneratedAt: DateTime
    category: Category!
    pinnedProductIds: [String!]
    pinnedProducts: [Product!]
  }

  extend type Query {
    seoPageByPath(path: String!): SeoPage
  }
`;
