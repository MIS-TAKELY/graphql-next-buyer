import { gql } from "@apollo/client";

export const GET_MY_ORDER_ITEMS = gql`
  query GetMyOrderItems($limit: Int!, $offset: Int!) {
    getMyOrderItems(limit: $limit, offset: $offset) {
      id
      orderNumber
      createdAt
      total
      status
      shippingSnapshot
      items {
        id
        quantity
        unitPrice
        totalPrice
        variant {
          id
          sku
          price
          product {
            id
            name
            slug
            images {
              url
            }
          }
        }
      }
    }
  }
`;
