import { gql } from "graphql-tag";

export const faqTypeDefs = gql`
  type ProductQuestion {
    id: ID!
    productId: String!
    userId: String!
    content: String!
    isPublic: Boolean!
    createdAt: DateTime!
    updatedAt: DateTime!
    
    user: User!
    answers: [ProductAnswer!]!
  }

  type ProductAnswer {
    id: ID!
    questionId: String!
    sellerId: String!
    content: String!
    createdAt: DateTime!
    updatedAt: DateTime!
    
    seller: User!
  }

  extend type Query {
    getProductQuestions(productId: ID!): [ProductQuestion!]!
  }

  extend type Mutation {
    askQuestion(productId: ID!, content: String!): ProductQuestion!
  }
`;
