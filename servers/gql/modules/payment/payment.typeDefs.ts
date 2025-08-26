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

  type EsewaPaymentResponse {
    paymentUrl: String!
  }

  input EsewaVerifyInput {
    orderId: ID!
    refId: String!
    amount: Float!
  }

  extend type Mutation {
    initiateEsewaPayment(orderId: ID!): EsewaPaymentResponse!
    verifyEsewaPayment(input: EsewaVerifyInput!): Payment!
  }
`;
