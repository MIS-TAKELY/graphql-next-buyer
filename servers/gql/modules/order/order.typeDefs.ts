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
    shippingSnapshot: Json!
    billingSnapshot: Json
    subtotal: Decimal!
    tax: Decimal!
    shippingFee: Decimal!
    discount: Decimal!
    total: Decimal!
    createdAt: DateTime!
    updatedAt: DateTime!
    buyer: User
    items: [OrderItem]
    payments: [Payment]
    shipments: [Shipment]
  }

  input OrderItemInput {
    variantId: ID!
    quantity: Int!
  }

  input AddressSnapshotInput {
    label : String!
    line1: String!
    line2: String
    city: String!
    state: String!
    postalCode: String!
    country: String!
    phone: String!
  }

  input CreateOrderInput {
    items: [OrderItemInput!]!
    shippingAddress: AddressSnapshotInput!
    billingAddress: AddressSnapshotInput
    shippingMethod: ShippingMethod = STANDARD
    couponCode: String
    paymentProvider: String!
    paymentMethodId: ID
  }

  extend type Mutation {
    createOrder(input: CreateOrderInput!): Order!
  }
`;
