import { gql } from "graphql-tag";

export const productTypeDefs = gql`
  enum ProductStatus {
    DRAFT
    ACTIVE
    INACTIVE
    DISCONTINUED
  }
  enum DiscountType {
    PERCENTAGE
    FIXED_AMOUNT
    BUY_X_GET_Y
    FREE_SHIPPING
  }
  scalar DateTime
  scalar JSON

  type Product {
    id: ID!
    sellerId: String!
    name: String!
    slug: String!
    categoryId: String
    description: String
    status: ProductStatus!
    brand: String
    createdAt: String!
    updatedAt: String!

    seller: User!
    variants: [ProductVariant!]
    images: [ProductImage!]
    reviews: [Review!]
    category: Category
    wishlistItems: [WishlistItem!]
    productOffers: [ProductOffer!]
    deliveryOptions: [DeliveryOption!]
    warranty: [Warranty!]

    returnPolicy: [ReturnPolicy!]
    features: [String]
    specificationTable: JSON
  }

  input CreateProductInput {
    name: String!
    description: String
    status: ProductStatus = DRAFT
    categoryId: String
    brandId: String
    variants: [CreateProductVariantInput!]!
    images: [CreateProductImageInput!]!
    promotionalImages: [CreateProductImageInput!]!
    returnPolicy: String
    warranty: String
  }

  type Query {
    getProducts(limit: Int, offset: Int): [Product!]!
    getProduct(productId: ID!): Product!
    getProductBySlug(slug: String!): Product!
    getRecommendedProducts(productId: ID, limit: Int): [Product!]!
    getProductsBySeller(sellerId: ID!): [Product!]!
    getRecentlyViewed: [Product!]!
    getFrequentlyBoughtTogether(productId: ID!, limit: Int): [Product!]!
    getProductsByIds(ids: [ID!]!): [Product!]!
  }

  type Mutation {
    recordProductView(productId: ID!): Boolean
  }
`;
