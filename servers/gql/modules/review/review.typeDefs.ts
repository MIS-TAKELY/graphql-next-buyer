import { gql } from "graphql-tag";

export const reviewTypeDefs = gql`
  scalar DateTime

  enum ReviewStatus {
    PENDING
    APPROVED
    REJECTED
  }

  enum MediaType {
    IMAGE
    VIDEO
  }

  type Review {
    id: ID!
    userId: String!
    productId: String!
    rating: Int!
    comment: String
    status: ReviewStatus
    isFeatured: Boolean
    helpfulCount: Int
    verifiedPurchase: Boolean
    orderItemId: String

    createdAt: DateTime!
    updatedAt: DateTime!

    user: User
    product: Product!
    media: [ReviewMedia]
    votes: [ReviewVote]
  }

  type ReviewVote {
    id: ID!
    reviewId: String
    userId: String
    vote: Int
    review: Review
    user: User
  }

  type ReviewMedia {
    id: ID!
    reviewId: String!
    type: MediaType
    url: String
  }

  input AddReview {
    userId: String!
    productId: String!
    rating: Int!
    comment: String
  }

  type Mutation {
    addReview(input: AddReview!): Review
  }
`;
