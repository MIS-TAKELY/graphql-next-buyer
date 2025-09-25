import { gql } from "@apollo/client";

export const GET_MY_ORDER_ITEMS = gql`
  query GetMyOrderItems {
    getMyOrderItems {
      items {
        order {
        orderNumber
        total
        createdAt
        status
      }
      }
      id
    }
  }
`;
