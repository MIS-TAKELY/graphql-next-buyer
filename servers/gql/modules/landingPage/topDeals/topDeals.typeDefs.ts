import gql from "graphql-tag";

export const topDealsTypeDefs = gql`
  type topDeals {
    imageUrl: String!
    imageAltText: String!
    saveUpTo: Float!
    name: String!
    category: Category!
    product: Product
  }

  type Query {
    getTopDealSaveUpTo(topDealAbout: String!, limit: Int): [topDeals!]!
  }
`;
