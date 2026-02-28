import gql from "graphql-tag";

export const GET_TOP_DEALS = gql`
  query GetTopDealSaveUpTo($topDealAbout: String!, $limit: Int!) {
    getTopDealSaveUpTo(topDealAbout: $topDealAbout, limit: $limit) {
      saveUpTo
      name
      imageUrl
      imageAltText
      category {
        id
        name
        slug
      }
      product {
        brand
        category {
          name
        }
      }
    }
  }
`;
