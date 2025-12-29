import { gql } from "@apollo/client";

export const HAS_ACTIVE_NOTIFICATION = gql`
  query HasActiveNotification($productId: String!, $variantId: String) {
    hasActiveNotification(productId: $productId, variantId: $variantId)
  }
`;

export const CREATE_PRODUCT_NOTIFICATION = gql`
  mutation CreateProductNotification($input: CreateProductNotificationInput!) {
    createProductNotification(input: $input) {
      id
      productId
      variantId
      userId
      email
      phone
      isNotified
      createdAt
    }
  }
`;

export const CANCEL_PRODUCT_NOTIFICATION = gql`
  mutation CancelProductNotification($productId: String!, $variantId: String) {
    cancelProductNotification(productId: $productId, variantId: $variantId) {
      success
      message
    }
  }
`;

export const NOTIFY_PRODUCT_RESTOCK = gql`
  mutation NotifyProductRestock($productId: String!, $variantId: String) {
    notifyProductRestock(productId: $productId, variantId: $variantId) {
      success
      message
      notifiedCount
    }
  }
`;
