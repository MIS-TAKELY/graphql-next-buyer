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

  type ReviewMedia {
    id: ID!
    reviewId: String!
    url: String!
    type: MediaType!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type ReviewVote {
    id: ID!
    reviewId: String
    userId: String
    vote: Int
    review: Review
    user: User
  }

  input ReviewMediaInput {
    url: String!
    type: MediaType!
  }

  input AddReviewInput {
    slug: String!
    rating: Int!
    comment: String
    media: [ReviewMediaInput]
  }

  input UpdateReviewInput {
    rating: Int
    comment: String
    media: [ReviewMediaInput]
  }

  extend type Query {
    getReview(id: ID!): Review
    getReviewsByProductSlug(
      slug: String!
      status: ReviewStatus
      rating: Int
      page: Int
      limit: Int
      offset: Int
      sortBy: String
    ): [Review]
    getReviewsByUser(
      userId: String!
      status: ReviewStatus
      page: Int
      limit: Int
      sortBy: String
    ): [Review]
    getAllReviews(
      status: ReviewStatus
      page: Int
      limit: Int
      sortBy: String
    ): [Review]
    getReviewStats(slug: String!): ReviewStats
  }

  type ReviewStats {
    average: Float!
    total: Int!
    counts: [RatingCount!]!
  }

  type RatingCount {
    rating: Int!
    count: Int!
  }

  type Mutation {
    addReview(input: AddReviewInput!): Boolean
    updateReview(id: ID!, input: UpdateReviewInput!): Review
    deleteReview(id: ID!): Boolean
  }
`;
