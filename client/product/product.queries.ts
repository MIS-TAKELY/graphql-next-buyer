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
        type
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
      images {
        id
        url
        altText
        sortOrder
      }
      reviews {
        id
        user
        rating
        date
        comment
        verified
      }
      variants {
        id
        price
        stock
        isDefault
      }
      category {
        name
      }
      seller {
        firstName
        lastName
      }
      brand {
        name
      }
      warranty
      specifications
      features
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
      brand {
        name
      }
      variants {
        stock
        isDefault
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
  query GetProducts {
    getProducts {
      id
      name
      description
      slug
      images {
        id
        url
        altText
      }
      status
      variants {
        id
        price
      }
      reviews {
        rating
      }
    }
  }
`;
