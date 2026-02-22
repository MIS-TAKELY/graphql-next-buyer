import gql from "graphql-tag";

export const topDealsTypeDefs = gql`
  type topDeals {
    imageUrl: String!
    imageAltText: String!
    saveUpTo: Float!
    name: String!
    product: Product
  }

  type Query {
    getTopDealSaveUpTo(topDealAbout: String!, limit: Int): [topDeals!]!
  }
`;
