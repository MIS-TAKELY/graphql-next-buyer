import { gql } from "@apollo/client";

// Get reviews for a product
export const GET_REVIEWS_BY_PRODUCT_BY_SLUG = gql`
  query GetReviewsByProductSlug($slug: String!) {
    getReviewsByProductSlug(slug: $slug) {
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
        name
      }
    }
  }
`;
