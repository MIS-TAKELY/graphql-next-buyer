import { gql } from "@apollo/client";

export const GET_CATEGORY_BY_SLUG = gql`
  query GetCategoryBySlug($slug: String!) {
    categoryBySlug(slug: $slug) {
      id
      name
      slug
      description
      metaTitle
      metaDescription
      keywords
    }
  }
`;

export const GET_PRODUCTS_BY_CATEGORY = gql`
  query GetProductsByCategory($categorySlug: String!, $limit: Int, $offset: Int) {
    getProductsByCategory(categorySlug: $categorySlug, limit: $limit, offset: $offset) {
      products {
        id
        name
        slug
        brand
        description
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
          specifications {
            key
            value
          }
        }
        reviews {
          id
          rating
        }
        category {
          id
          name
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
      total
      category {
        id
        name
        slug
        description
      }
    }
  }
`;
