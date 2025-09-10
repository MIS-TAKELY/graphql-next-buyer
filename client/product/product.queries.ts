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
      # salePrice
      # saleStart
      # saleEnd
      returnPolicy
      warranty
      category {
        id
        name
        slug
        parent {
          id
          name
        }
      }
      brand {
        id
        name
        slug
      }
      seller {
        id
        firstName
        lastName
      }
      images {
        id
        url
        altText
        sortOrder
        type
      }
      variants {
        id
        price
        stock
        isDefault
        attributes
      }
      reviews {
        id
        rating
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
