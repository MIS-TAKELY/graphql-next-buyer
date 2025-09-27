import { gql } from "graphql-tag";

export const wishlistTypeDefs = gql`
  scalar DateTime

  type Wishlist {
    id: ID!
    userId: String!
    name: String!
    createdAt: DateTime!
    updatedAt: DateTime!
    user: [User!]!
    items: [WishlistItem!]!
  }

  type WishlistItem {
    id: ID!
    wishlistId: String!
    productId: String!
    product: Product!
    createdAt: DateTime!
  }

  extend type Query {
    myWishlists: [Wishlist!]!

    wishlistItems(wishlistId: ID!): [WishlistItem!]!
  }

  extend type Mutation {
    addToWishlist(productId: ID!): WishlistItem!

    removeFromWishlist(wishlistId: String!, productId: String!): Boolean!

    createWishlist(name: String!): Wishlist!

    deleteWishlist(wishlistId: ID!): Boolean!
  }
`;
