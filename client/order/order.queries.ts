import { gql } from "@apollo/client";

export const GET_MY_ORDER_ITEMS = gql`
  query GetMyOrderItems($limit: Int!, $offset: Int!) {
    getMyOrderItems(limit: $limit, offset: $offset) {
      id
      orderNumber
      createdAt
      updatedAt
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
          attributes
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
      disputes {
        id
        status
        type
        reason
        description
        images
      }
    }
  }
`;

export const CANCEL_ORDER = gql`
  mutation CancelOrder($input: CancelOrderInput!) {
    cancelOrder(input: $input) {
      id
      status
      type
    }
  }
`;

export const REQUEST_RETURN = gql`
  mutation RequestReturn($input: RequestReturnInput!) {
    requestReturn(input: $input) {
      id
      status
      type
    }
  }
`;
