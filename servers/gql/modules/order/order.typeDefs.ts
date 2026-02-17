import { gql } from "graphql-tag";

export const orderTypeDefs = gql`
  # ENUMS
  enum OrderStatus {
    PENDING
    CONFIRMED
    PROCESSING
    SHIPPED
    DELIVERED
    CANCELLED
    RETURNED
  }

  # SCALARS
  scalar DateTime
  scalar Decimal
  scalar Json

  # ORDER
  type Order {
    id: ID!
    orderNumber: String!
    buyerId: String!
    status: OrderStatus!
    cancellationReason: String
    shippingSnapshot: Json!
    billingSnapshot: Json
    subtotal: Decimal!
    tax: Decimal!
    shippingFee: Decimal!
    total: Decimal!
    createdAt: DateTime!
    updatedAt: DateTime!
    buyer: User
    items: [OrderItem]
    payments: [Payment]
    shipments: [Shipment]
    disputes: [OrderDispute]
    returns: [Return]
  }

  input OrderItemInput {
    variantId: ID!
    quantity: Int!
  }

  input AddressSnapshotInput {
    label: String!
    line1: String!
    line2: String
    city: String!
    state: String!
    postalCode: String!
    country: String!
    phoneNumber: String!
  }

  input CreateOrderInput {
    items: [OrderItemInput!]!
    shippingAddress: AddressSnapshotInput!
    billingAddress: AddressSnapshotInput
    shippingMethod: ShippingMethod = STANDARD
    couponCode: String
    paymentProvider: String!
    paymentMethodId: ID
    idempotencyKey: String
  }
  enum DisputeStatus {
    PENDING
    APPROVED
    REJECTED
    RESOLVED
  }

  enum DisputeType {
    CANCEL
    RETURN
  }

  type OrderDispute {
    id: ID!
    orderId: ID!
    sellerOrderId: ID
    userId: ID!
    reason: String!
    description: String
    images: [String]
    status: DisputeStatus!
    type: DisputeType!
    createdAt: DateTime!
    updatedAt: DateTime!
    order: Order
    user: User
  }

  input RequestReturnInput {
    orderId: ID!
    reason: String!
    description: String
    images: [String]
  }

  input CancelOrderInput {
    orderId: ID!
    reason: String!
  }

  extend type Query {
    getMyOrderItems(limit: Int!, offset: Int!): [Order!]!
    getDisputes(limit: Int!, offset: Int!): [OrderDispute!]!
    getSellerDisputes(limit: Int!, offset: Int!): [OrderDispute!]!
  }
  extend type Mutation {
    createOrder(input: [CreateOrderInput!]!): [Order!]!
    cancelOrder(input: CancelOrderInput!): OrderDispute!
    requestReturn(input: RequestReturnInput!): Return!
    updateDisputeStatus(disputeId: ID!, status: DisputeStatus!): OrderDispute!
  }
`;
