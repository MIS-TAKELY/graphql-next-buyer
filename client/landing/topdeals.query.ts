import gql from "graphql-tag";

export const GET_TOP_DEALS = gql`
    query GetTopDealsaveUpTo($topDealAbout: String!,$limit:Int!) {
      getTopDealsaveUpTo(topDealAbout: $topDealAbout,limit:$limit) {
        saveUpTo
        name
        imageUrl
        imageAltText
      }
    }
  `;
