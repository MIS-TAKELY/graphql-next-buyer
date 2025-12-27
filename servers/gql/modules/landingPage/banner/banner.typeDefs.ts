import { gql } from "graphql-tag";

export const bannerTypeDefs = gql`
  type LandingPageBanner {
    id: ID!
    title: String!
    description: String
    imageUrl: String!
    link: String
    sortOrder: Int!
    isActive: Boolean!
    mediaType: String!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  input CreateBannerInput {
    title: String!
    description: String
    imageUrl: String!
    link: String
    isActive: Boolean
    mediaType: String
  }

  input UpdateBannerInput {
    title: String
    description: String
    imageUrl: String
    link: String
    isActive: Boolean
  }

  type BannerResponse {
    success: Boolean!
    message: String
    banner: LandingPageBanner
  }

  extend type Query {
    getLandingPageBanners: [LandingPageBanner!]!
    getLandingPageBanner(id: ID!): LandingPageBanner
  }

  extend type Mutation {
    createLandingPageBanner(input: CreateBannerInput!): BannerResponse!
    updateLandingPageBanner(id: ID!, input: UpdateBannerInput!): BannerResponse!
    deleteLandingPageBanner(id: ID!): BannerResponse!
    reorderLandingPageBanners(ids: [ID!]!): BannerResponse!
  }
`;
