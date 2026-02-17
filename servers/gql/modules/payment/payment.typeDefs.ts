import { gql } from "graphql-tag";

export const paymentTypeDefs = gql`
  enum PaymentStatus {
    PENDING
    COMPLETED
    FAILED
    REFUNDED
  }

  scalar Decimal
  scalar DateTime

  type Payment {
    id: ID!
    orderId: String!
    methodId: String
    amount: Decimal!
    currency: String!
    status: PaymentStatus!
    transactionId: String
    provider: String!
    createdAt: DateTime!
    updatedAt: DateTime!

    order: Order!
    method: PaymentMethod
  }

  type EsewaPaymentInitiation {
    success: Boolean!
    paymentUrl: String
    paymentData: EsewaPaymentData
    error: String
  }

  type EsewaPaymentData {
    amount: String!
    tax_amount: String!
    total_amount: String!
    transaction_uuid: String!
    product_code: String!
    product_service_charge: String!
    product_delivery_charge: String!
    success_url: String!
    failure_url: String!
    signed_field_names: String!
    signature: String!
  }

  type FonepayPaymentInitiation {
    success: Boolean!
    qrValue: String
    error: String
  }

  type FonepayPaymentData {
    amount: String!
    transaction_uuid: String!
    merchant_code: String!
    signature: String!
  }

  type PaymentVerificationResult {
    success: Boolean!
    payment: Payment
    order: Order
    message: String
  }

  type Mutation {
    initiateEsewaPayment(orderId: ID!): EsewaPaymentInitiation!
    verifyEsewaPayment(data: String!): PaymentVerificationResult!
    initiateFonepayPayment(orderId: ID!): FonepayPaymentInitiation!
    verifyFonepayPayment(orderId: ID!, transactionId: String!, signature: String!, amount: String!): PaymentVerificationResult!
  }
`;
