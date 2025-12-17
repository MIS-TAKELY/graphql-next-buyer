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
          clerkId
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

export const GET_ALL_CONVERSATIONS = gql`
  query GetAllConversations {
    conversations(recieverId: "") {
      id
      title
      updatedAt
      unreadCount
      product {
        id
        name
        slug
      }
      reciever {
        id
        firstName
        lastName
        avatarImageUrl
      }
      sender {
        id
        firstName
        lastName
        avatarImageUrl
      }
      lastMessage {
        id
        content
        type
        sentAt
        sender {
          id
        }
      }
    }
  }
`;
