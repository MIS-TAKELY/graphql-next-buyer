import { gql } from "@apollo/client";

export const CREATE_PAYMENT_METHOD = gql`
  mutation CreatePaymentMethod($input: PaymentMethodInput!) {
    createPaymentMethod(input: $input) {
      id
      type
      provider
      last4
      upiId
      isDefault
      createdAt
    }
  }
`;

export const PROCESS_PAYMENT = gql`
  mutation ProcessPayment($input: PaymentInput!) {
    processPayment(input: $input) {
      id
      status
      transactionId
      amount
      currency
      provider
      createdAt
      order {
        id
        status
      }
    }
  }
`;

export const CREATE_ORDER = gql`
  mutation CreateOrder($input: CreateOrderInput!) {
    createOrder(input: $input) {
      id
      orderNumber
      status
      subtotal
      tax
      shippingFee
      discount
      total
      items {
        id
        quantity
        unitPrice
        totalPrice
        variant {
          id
        }
      }
      payments {
        id
        status
        provider
        amount
      }
      shipments {
        id
        method
        status
      }
      createdAt
    }
  }
`;

export const VALIDATE_PAYMENT = gql`
  mutation ValidatePayment($paymentId: ID!, $validationData: JSON!) {
    validatePayment(paymentId: $paymentId, validationData: $validationData) {
      id
      status
      isValidated
      validatedAt
    }
  }
`;

export const INITIATE_ESEWA_PAYMENT = gql`
  mutation InitiateEsewaPayment($orderId: ID!) {
    initiateEsewaPayment(orderId: $orderId) {
      paymentUrl
    }
  }
`;

export const VERIFY_ESEWA_PAYMENT = gql`
  mutation VerifyEsewaPayment($input: EsewaVerifyInput!) {
    verifyEsewaPayment(input: $input) {
      id
      status
      transactionId
      amount
      currency
      provider
      createdAt
      order {
        id
        status
      }
    }
  }
`;
