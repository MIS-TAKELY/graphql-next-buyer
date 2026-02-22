import gql from "graphql-tag";

export const GET_TOP_DEALS = gql`
  query GetTopDealSaveUpTo($topDealAbout: String!, $limit: Int!) {
    getTopDealSaveUpTo(topDealAbout: $topDealAbout, limit: $limit) {
      id
      name
      slug
      brand
      status
      description
      createdAt
      saveUpTo
      imageUrl
      imageAltText
      images {
        id
        url
        altText
        mediaType
      }
      variants {
        id
        price
        mrp
        stock
        isDefault
        attributes
        specifications {
          key
          value
        }
      }
      category {
        id
        name
      }
      reviews {
        id
        rating
      }
      productOffers {
        id
        offer {
          type
          value
          isActive
        }
      }
    }
  }
`;
