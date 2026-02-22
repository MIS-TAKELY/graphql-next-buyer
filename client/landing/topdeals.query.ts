import { PRODUCT_CARD_FRAGMENT } from "../product/product.queries";
import gql from "graphql-tag";

export const GET_TOP_DEALS = gql`
  query GetTopDealSaveUpTo($topDealAbout: String!, $limit: Int!) {
    getTopDealSaveUpTo(topDealAbout: $topDealAbout, limit: $limit) {
      ...ProductCardFields
      saveUpTo
      imageUrl
      imageAltText
    }
  }
  ${PRODUCT_CARD_FRAGMENT}
`;
