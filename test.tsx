// servers/gql/schema/user.typeDefs.ts
import { gql } from "graphql-tag";

export const userTypeDefs = gql`
  enum Role {
    BUYER
    SELLER
    ADMIN
  }

  scalar DateTime

   enum Gender {
    MALE
    FEMALE
    OTHERS
    NOT_TO_SAY
  }


  type UserRole {
    id: ID!
    userId: ID!
    role: Role!
    user: User! # Resolve full user
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type Notification {
    id: ID!
    userId: ID!
    title: String!
    body: String
    type: String
    data: Json
    isRead: String
    createdAt: DateTime
    updatedAt: DateTime
  }

  type User {
    id: ID!
    email: String!
    firstName: String
    lastName: String
    phone: String
    avatarImageUrl: String
    gender: Gender
    dob: DateTime

    "User can have multiple roles (e.g., both BUYER and SELLER)"
    roles: [UserRole!]! # ← NEW: Array of roles (non-null)
    createdAt: DateTime!
    updatedAt: DateTime!

    # Relations
    addresses: [Address!]
    paymentMethods: [PaymentMethod!]
    cartItems: [CartItem!]
    orders: [Order!]
    reviews: [Review!]
    products: [Product!] # Products they sell
    payouts: [Payout!]
    sellerOrders: [SellerOrder!]
    wishlists: [Wishlist!]
    sellerProfile: SellerProfile # One-to-one relation
    notifications: [Notification!]
  }

  # Optional: Helpful query to get current user
  extend type Query {
    me: User
    meSellerProfile: SellerProfile
  }
`;
