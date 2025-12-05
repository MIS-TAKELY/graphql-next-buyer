import gql from "graphql-tag";

export const GET_CONVERSATION_BY_PRODUCT = gql`
  query GetConversationByProduct($productId: ID!) {
    conversationByProduct(productId: $productId) {
      id
      title
      product {
        id
        name
        slug
      }
      sender {
        id
        firstName
        lastName
      }
      reciever {
        id
        firstName
        lastName
      }
      messages {
        id
        content
        type
        sentAt
        sender {
          id
          firstName
          lastName
          roles {
            role
          }
        }
      }
    }
  }
`;
