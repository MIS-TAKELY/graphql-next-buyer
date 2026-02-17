import { gql } from "@apollo/client";

export const CREATE_PAYMENT_METHOD = gql`
  mutation CreatePaymentMethod($input: PaymentMethodInput!) {
    createPaymentMethod(input: $input) {
      id
      type
      provider
      last
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
  mutation CreateOrder($input: [CreateOrderInput!]!) {
    createOrder(input: $input) {
      id
      orderNumber
      status
      subtotal
      tax
      shippingFee
      total
    }
  }
`;

export const CREATE_CART_ORDER = gql`
  mutation CreateOrder($input: [CreateOrderInput!]!) {
    createOrder(input: $input) {
      id
      orderNumber
      status
      subtotal
      tax
      shippingFee
      total
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

// export const CREATE_ORDER = gql`
//   mutation CreateOrder($input: CreateOrderInput!) {
//     createOrder(input: $input) {
//       id
//     }
//   }
// `;

export const INITIATE_ESEWA_PAYMENT = gql`
  mutation InitiateEsewaPayment($orderId: ID!) {
    initiateEsewaPayment(orderId: $orderId) {
      success
      paymentUrl
      paymentData {
        amount
        tax_amount
        total_amount
        transaction_uuid
        product_code
        product_service_charge
        product_delivery_charge
        success_url
        failure_url
        signed_field_names
        signature
      }
      error
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

export const INITIATE_FONEPAY_PAYMENT = gql`
  mutation InitiateFonepayPayment($orderId: ID!) {
    initiateFonepayPayment(orderId: $orderId) {
      success
      qrValue
      error
    }
  }
`;

export const VERIFY_FONEPAY_PAYMENT = gql`
  mutation VerifyFonepayPayment($orderId: ID!, $transactionId: String!, $signature: String!, $amount: String!) {
    verifyFonepayPayment(orderId: $orderId, transactionId: $transactionId, signature: $signature, amount: $amount) {
      success
      message
    }
  }
`;
