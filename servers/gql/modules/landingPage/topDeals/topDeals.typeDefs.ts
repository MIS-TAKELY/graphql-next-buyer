import gql from "graphql-tag";

export const topDealsTypeDefs = gql`
  type topDeals {
    id: ID!
    name: String!
    slug: String!
    description: String
    brand: String
    status: String
    features: [String]
    specificationTable: JSON
    imageUrl: String
    imageAltText: String
    saveUpTo: Float!
    discountPercentage: Float
    avgRating: Float
    variants: [ProductVariant!]
    images: [ProductImage!]
    reviews: [Review!]
    category: Category
    productOffers: [ProductOffer!]
    createdAt: String!
    product: Product
  }

  type Query {
    getTopDealSaveUpTo(topDealAbout: String!, limit: Int): [topDeals!]!
  }
`;
