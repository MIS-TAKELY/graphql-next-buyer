import { gql } from "@apollo/client";

export const PRODUCT_FIELDS_FRAGMENT = gql`
  fragment ProductFields on Product {
    id
    name
    description
    slug
    status
    brand
    images {
      id
      url
      altText
      mediaType
    }
    variants {
      id
      price
      mrp
      stock
      isDefault
      attributes
      specifications {
        key
        value
      }
    }
    reviews {
      id
      rating
      comment
      createdAt
      user {
        id
        firstName
        lastName
      }
    }
    category {
      id
      name
      parent {
        id
        name
      }
    }
    seller {
      id
      firstName
      lastName
    }
    warranty {
      type
      duration
      unit
      description
    }
    returnPolicy {
      type
      duration
      unit
      conditions
    }
    deliveryOptions {
      title
      description
    }
    productOffers {
      id
      offer {
        title
        description
        type
        value
        startDate
        endDate
        isActive
      }
    }
    features
    specificationTable
    metaTitle
    metaDescription
    keywords
    createdAt
  }
`;

export const PRODUCT_CARD_FRAGMENT = gql`
  fragment ProductCardFields on Product {
    id
    name
    slug
    brand
    status
    description
    features
    createdAt
    images {
      id
      url
      altText
      mediaType
    }
    variants {
      id
      price
      mrp
      stock
      isDefault
      attributes
      specifications {
        key
        value
      }
    }
    specificationTable {
      rows
    }
    category {
      id
      name
      categorySpecification {
        key
        label
        value
      }
    }
    reviews {
      id
      rating
    }
    productOffers {
      id
      offer {
        type
        value
        isActive
      }
    }
  }
`;

export const GET_PRODUCT_CATEGORIES = gql`
  query GetProductCategories {
    categories {
      id
      name
      children {
        id
        name
        categorySpecification {
          id
          key
          label
          placeholder
        }
      }
      categorySpecification {
        id
        key
        label
        placeholder
      }
    }
  }
`;

export const GET_PRODUCT = gql`
  query GetProduct($productId: ID!) {
    getProduct(productId: $productId) {
      ...ProductFields
    }
  }
  ${PRODUCT_FIELDS_FRAGMENT}
`;

export const GET_PRODUCT_BY_SLUG = gql`
  query GetProductBySlug($slug: String!) {
    getProductBySlug(slug: $slug) {
      ...ProductFields
    }
  }
  ${PRODUCT_FIELDS_FRAGMENT}
`;

export const GET_REMAINING_PRODUCT_BY_SLUG = gql`
  query GetProductBySlug($slug: String!) {
    getProductBySlug(slug: $slug) {
      ...ProductFields
    }
  }
  ${PRODUCT_FIELDS_FRAGMENT}
`;

export const GET_PRODUCT_DETAILS = gql`
  query GetProductDetails($slug: String!) {
    getProductBySlug(slug: $slug) {
      ...ProductFields
    }
  }
  ${PRODUCT_FIELDS_FRAGMENT}
`;

export const GET_PRODUCTS = gql`
  query GetProducts($limit: Int, $offset: Int) {
    getProducts(limit: $limit, offset: $offset) {
      ...ProductCardFields
    }
  }
  ${PRODUCT_CARD_FRAGMENT}
`;

export const GET_PRODUCTS_MINIMAL = gql`
  query GetProductsMinimal($limit: Int, $offset: Int) {
    getProducts(limit: $limit, offset: $offset) {
      ...ProductCardFields
    }
  }
  ${PRODUCT_CARD_FRAGMENT}
`;

export const GET_PRODUCTS_BY_SELLER = gql`
  query GetProductsBySeller($sellerId: ID!) {
    getProductsBySeller(sellerId: $sellerId) {
      ...ProductCardFields
    }
  }
  ${PRODUCT_CARD_FRAGMENT}
`;

export const RECORD_PRODUCT_VIEW = gql`
  mutation RecordProductView($productId: ID!) {
    recordProductView(productId: $productId)
  }
`;

export const GET_RECENTLY_VIEWED = gql`
  query GetRecentlyViewed {
    getRecentlyViewed {
      ...ProductCardFields
    }
  }
  ${PRODUCT_CARD_FRAGMENT}
`;

export const GET_FREQUENTLY_BOUGHT_TOGETHER = gql`
  query GetFrequentlyBoughtTogether($productId: ID!, $limit: Int) {
    getFrequentlyBoughtTogether(productId: $productId, limit: $limit) {
      ...ProductCardFields
    }
  }
  ${PRODUCT_CARD_FRAGMENT}
`;

export const GET_RECOMMENDED_PRODUCTS = gql`
  query GetRecommendedProducts($productId: ID) {
    getRecommendedProducts(productId: $productId) {
      ...ProductCardFields
    }
  }
  ${PRODUCT_CARD_FRAGMENT}
`;
export const GET_PRODUCTS_BY_IDS = gql`
  query GetProductsByIds($ids: [ID!]!) {
    getProductsByIds(ids: $ids) {
      ...ProductCardFields
    }
  }
  ${PRODUCT_CARD_FRAGMENT}
`;

