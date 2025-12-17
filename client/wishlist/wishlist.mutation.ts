import gql from "graphql-tag";

export const REMOVE_FROM_WISHLIST = gql`
  mutation RemoveFromWishlist($productId: String!, $wishlistId: String!) {
    removeFromWishlist(productId: $productId, wishlistId: $wishlistId)
  }
`;

export const ADD_TO_WISHLIST = gql`
  mutation AddToWishlist($productId: ID!) {
    addToWishlist(productId: $productId) {
        id
        wishlistId
        product {
          id
          name
          variants {
            id
            price
            mrp
            stock
          }
          images {
            url
          }
      }
    }
  }
`;
