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
      cancellationReason
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
            returnPolicy {
              type
              duration
              unit
            }
          }
        }
      }
      shipments {
        status
        deliveredAt
      }
      disputes {
        id
        status
        type
        reason
        description
        images
      }
      returns {
        id
        status
        type
        items {
          id
          quantity
          orderItem {
             id
          }
        }
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
  mutation CreateReturnRequest($input: CreateReturnInput!) {
    createReturnRequest(input: $input) {
      id
      status
      type
    }
  }
`;
