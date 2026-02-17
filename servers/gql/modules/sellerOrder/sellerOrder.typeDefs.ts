import { gql } from "graphql-tag";

export const sellerOrderTypeDefs = gql`
  enum OrderStatus {
    PENDING
    CONFIRMED
    PROCESSING
    SHIPPED
    DELIVERED
    CANCELLED
    RETURNED
  }

  scalar Decimal
  scalar DateTime

  type SellerOrder {
    id: ID!
    sellerId: String!
    buyerOrderId: String!
    status: OrderStatus!
    cancellationReason: String
    subtotal: Decimal!
    tax: Decimal!
    shippingFee: Decimal!
    commission: Decimal!
    total: Decimal!
    createdAt: DateTime!
    updatedAt: DateTime!

    seller: User!
    order: Order
    items: [SellerOrderItem!]
  }

  extend type Query {
    getSellerOrders(limit: Int!, offset: Int!, status: OrderStatus): [SellerOrder!]!
  }

  extend type Mutation {
    updateSellerOrderStatus(
      sellerOrderId: ID!
      status: OrderStatus!
      cancellationReason: String
      trackingNumber: String
      carrier: String
    ): SellerOrder!
  }
`;
