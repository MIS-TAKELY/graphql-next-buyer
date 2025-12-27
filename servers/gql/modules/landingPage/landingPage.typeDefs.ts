export const landingPageTypeDefs = `#graphql
  type LandingPageCategoryCard {
    id: ID!
    categoryId: String!
    categoryName: String!
    image: String
    count: String!
    color: String!
    darkColor: String
    sortOrder: Int!
    isActive: Boolean!
  }

  type LandingPageCategorySwiper {
    id: ID!
    title: String!
    category: String!
    sortOrder: Int!
    isActive: Boolean!
  }

  type LandingPageProductGrid {
    id: ID!
    title: String!
    topDealAbout: String!
    productIds: [String!]
    sortOrder: Int!
    isActive: Boolean!
  }

  extend type Query {
    getLandingPageCategoryCards: [LandingPageCategoryCard!]!
    getLandingPageCategorySwipers: [LandingPageCategorySwiper!]!
    getLandingPageProductGrids: [LandingPageProductGrid!]!
  }
`;
