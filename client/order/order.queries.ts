import { gql } from "@apollo/client";

export const GET_MY_ORDER_ITEMS = gql`
  query GetMyOrderItems($limit: Int!, $offset: Int!) {
    getMyOrderItems(limit: $limit, offset: $offset) {
      id
      items {
        order {
          orderNumber
          createdAt
          total
          status
        }
      }
    }
  }
`;
