import gql from "graphql-tag";

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
    }
  }
`;
