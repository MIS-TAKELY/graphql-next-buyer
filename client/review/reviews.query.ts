import { gql } from "@apollo/client";

// Get reviews for a product
export const GET_REVIEWS_BY_PRODUCT_BY_SLUG = gql`
  query GetReviewsByProductSlug($slug: String!, $rating: Int, $offset: Int, $limit: Int) {
    getReviewsByProductSlug(slug: $slug, rating: $rating, offset: $offset, limit: $limit) {
      id
      rating
      comment
      status
      isFeatured
      helpfulCount
      verifiedPurchase
      createdAt
      updatedAt
      user {
        id
        firstName
        lastName
        clerkId
      }
      media {
        id
        type
        url
      }
      votes {
        id
        vote
        userId
      }
    }
  }
`;

export const GET_REVIEW_STATS = gql`
  query GetReviewStats($slug: String!) {
    getReviewStats(slug: $slug) {
      average
      total
      counts {
        rating
        count
      }
    }
  }
`;

// Get a single review by ID
export const GET_REVIEW = gql`
  query GetReview($id: ID!) {
    getReview(id: $id) {
      id
      rating
      comment
      status
      createdAt
      updatedAt
      media {
        id
        type
        url
      }
      user {
        id
        firstName
        lastName
      }
    }
  }
`;
