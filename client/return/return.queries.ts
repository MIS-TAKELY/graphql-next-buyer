import { gql } from "@apollo/client";

export const GET_MY_RETURNS = gql`
  query MyReturns($limit: Int, $offset: Int) {
    myReturns(limit: $limit, offset: $offset) {
      id
      orderId
      status
      refundStatus
      reason
      type
      createdAt
      items {
        id
        quantity
        orderItem {
          id
          variant {
            product {
              name
              images {
                url
              }
            }
          }
        }
      }
      order {
        orderNumber
      }
    }
  }
`;

export const GET_RETURN_DETAILS = gql`
  query GetReturn($id: ID!) {
    getReturn(id: $id) {
      id
      orderId
      status
      refundStatus
      refundMethod
      refundAmount
      reason
      description
      images
      type
      logisticsMode
      trackingNumber
      pickupAddressId
      createdAt
      pickupScheduledAt
      receivedAt
      inspectedAt
      rejectionReason
      order {
        orderNumber
      }
      items {
        id
        quantity
        reason
        orderItem {
          id
          variant {
            product {
              name
              images {
                url
              }
            }
          }
        }
      }
    }
  }
`;

export const CANCEL_RETURN_REQUEST = gql`
  mutation CancelReturnRequest($id: ID!) {
    cancelReturnRequest(id: $id) {
      id
      status
    }
  }
`;
