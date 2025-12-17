import { gql } from "@apollo/client";

export const GET_PRODUCT_QUESTIONS = gql`
  query GetProductQuestions($productId: ID!) {
    getProductQuestions(productId: $productId) {
      id
      productId
      content
      createdAt
      user {
        firstName
        lastName
      }
      answers {
        id
        content
        createdAt
        seller {
          sellerProfile {
            shopName
          }
        }
      }
    }
  }
`;

export const ASK_QUESTION = gql`
  mutation AskQuestion($productId: ID!, $content: String!) {
    askQuestion(productId: $productId, content: $content) {
      id
      productId
      content
      createdAt
      user {
        firstName
        lastName
      }
      answers {
        id
      }
    }
  }
`;
