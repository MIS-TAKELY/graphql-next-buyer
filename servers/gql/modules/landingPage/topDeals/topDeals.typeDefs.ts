import gql from "graphql-tag";

export const topDealsTypeDefs = gql`
  type topDeals {
    imageUrl: String!
    imageAltText:String!
    saveUpTo: Float!
    name: String!
  }

  type Query {
    #getTopDealsaveUpTo(topDealAbout: String!): Boolean
    getTopDealsaveUpTo(topDealAbout: String!,limit:Int): [topDeals!]!
  }
`;
