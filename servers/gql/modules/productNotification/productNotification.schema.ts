export const productNotificationTypeDefs = `#graphql
  type ProductNotification {
    id: ID!
    productId: String!
    variantId: String
    userId: String
    email: String
    phone: String
    isNotified: Boolean!
    createdAt: String!
    updatedAt: String!
  }

  input CreateProductNotificationInput {
    productId: String!
    variantId: String
    email: String
    phone: String
  }

  type Query {
    hasActiveNotification(productId: String!, variantId: String): Boolean!
  }

  type Mutation {
    createProductNotification(input: CreateProductNotificationInput!): ProductNotification!
    notifyProductRestock(productId: String!, variantId: String): NotifyRestockResult!
    cancelProductNotification(productId: String!, variantId: String): CancelNotificationResult!
  }

  type NotifyRestockResult {
    success: Boolean!
    message: String!
    notifiedCount: Int!
  }

  type CancelNotificationResult {
    success: Boolean!
    message: String!
  }
`;
