import { gql } from "@apollo/client";

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
      Category {
        name
        id
        parent {
          id
          name
        }
      }
      id
      name
      description
      returnPolicy
      warranty
      images {
        id
        url
        altText
      }
      variants {
        price
        sku
        productId
        stock
        specifications {
          key
          value
        }
      }
    }
  }
`;

export const GET_PRODUCT_BY_SLUG = gql`
  query GetProductBySlug($slug: String!) {
    getProductBySlug(slug: $slug) {
      id
      name
      description
      slug
      status
      returnPolicy {
        type
        duration
        unit
        conditions
      }
      warranty {
        type
        duration
        unit
        description
      }
      images {
        id
        url
        altText
        mediaType
      }
      reviews {
        id
        user {
          id
        }
        rating
        comment
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
      features
      category {
        name
      }
      seller {
        id
        firstName
        lastName
      }
      brand
      productOffers {
        id
        offer {
          description
          endDate
          isActive
          startDate
          title
          type
          value
        }
      }
      deliveryOptions {
        description
        title
      }
    }
  }
`;

export const GET_REMAINING_PRODUCT_BY_SLUG = gql`
  query GetProductBySlug($slug: String!) {
    getProductBySlug(slug: $slug) {
      category {
        name
      }
      seller {
        firstName
        lastName
      }
      brand
      variants {
        stock
        isDefault
        attributes
        specifications {
          key
          value
        }
      }
      productOffers {
        id
        offer {
          description
          endDate
          isActive
          startDate
          title
          type
          value
        }
      }
      deliveryOptions {
        description
        title
      }
    }
  }
`;

export const GET_PRODUCT_DETAILS = gql`
  query GetProductDetails($slug: String!) {
    getProductBySlug(slug: $slug) {
      id
      returnPolicy
      warranty
      category {
        id
        name
        parent {
          id
          name
        }
      }
      brand {
        id
        name
      }
      seller {
        id
        firstName
        lastName
      }
      variants {
        id
        stock
        isDefault
      }
      reviews {
        id
        comment
        createdAt
        user {
          firstName
          lastName
        }
      }
    }
  }
`;

export const GET_PRODUCTS = gql`
  query GetProducts($limit: Int, $offset: Int) {
    getProducts(limit: $limit, offset: $offset) {
      id
      name
      description
      slug
      status
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
      }
      reviews {
        rating
      }
      category {
        id
        name
      }
      seller {
        id
        firstName
        lastName
      }
      brand
      warranty {
      description
      duration
    }
      productOffers {
        id
        offer {
          description
          endDate
          isActive
          startDate
          title
          type
          value
        }
      }
    }
  }
`;

export const GET_PRODUCTS_MINIMAL = gql`
  query GetProductsMinimal($limit: Int, $offset: Int) {
    getProducts(limit: $limit, offset: $offset) {
      id
      name
      slug
      status
      images {
        id
        url
        altText
      }
      variants {
        id
        price
        mrp
        stock
        isDefault
      }
      reviews {
        rating
      }
      brand
    }
  }
`;

export const GET_PRODUCTS_BY_SELLER = gql`
  query GetProductsBySeller($sellerId: ID!) {
    getProductsBySeller(sellerId: $sellerId) {
      id
      name
      description
      slug
      status
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
      }
      reviews {
        rating
      }
      category {
        id
        name
      }
      seller {
        id
        firstName
        lastName
      }
      brand
      warranty {
        description
        duration
      }
      productOffers {
        id
        offer {
          description
          endDate
          isActive
          startDate
          title
          type
          value
        }
      }
    }
  }
`;

export const RECORD_PRODUCT_VIEW = gql`
  mutation RecordProductView($productId: ID!) {
    recordProductView(productId: $productId)
  }
`;

export const GET_RECENTLY_VIEWED = gql`
  query GetRecentlyViewed {
    getRecentlyViewed {
      id
      name
      description
      slug
      status
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
      }
      reviews {
        rating
      }
      category {
        id
        name
      }
      seller {
        id
        firstName
        lastName
      }
      brand
    }
  }
`;

export const GET_FREQUENTLY_BOUGHT_TOGETHER = gql`
  query GetFrequentlyBoughtTogether($productId: ID!, $limit: Int) {
    getFrequentlyBoughtTogether(productId: $productId, limit: $limit) {
      id
      name
      description
      slug
      images {
        url
        altText
      }
      reviews {
        rating
      }
      variants {
        id
        price
        mrp
        stock
        isDefault
        specifications {
          key
          value
        }
      }
      brand
    }
  }
`;

export const GET_RECOMMENDED_PRODUCTS = gql`
  query GetRecommendedProducts($productId: ID) {
    getRecommendedProducts(productId: $productId) {
      id
      name
      description
      brand
      slug
      images {
        url
        altText
      }
      reviews {
        rating
      }
      variants {
        id
        price
        mrp
        sku
        stock
        isDefault
        specifications {
          key
          value
        }
      }
    }
  }
`;
