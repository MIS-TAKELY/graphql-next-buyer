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
        fileType
        altText
        mediaType
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
      category {
        name
      }
      seller {
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
        mediaType
      }
      status
      variants {
        id
        price
        mrp
      }
      reviews {
        rating
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
