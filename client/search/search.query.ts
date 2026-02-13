import gql from "graphql-tag";


export const MAKE_SEARCH_QUERY = gql`
  query SearchProducts($query: String!, $filters: SearchFilters, $page: Int, $limit: Int) {
    searchProducts(query: $query, filters: $filters, page: $page, limit: $limit) {
      products {
        id
        name
        description
        features
        variants {
          price
          mrp
          attributes
          specifications {
            key
            value
          }
        }
        specificationTable
        images {
          altText
          url
          mediaType
        }
        reviews {
          rating
        }
        deliveryOptions {
          title
        }
        brand
        slug
        category {
          name
          categorySpecification {
            key
            label
          }
        }
      }
      filters {
        key
        label
        type
        options {
          value
          count
        }
      }
      intent {
        price_max
        price_min
        brand
        specifications
      }
      dominantCategory
      pagination {
        page
        limit
        total
        totalPages
      }
    }
  }
`;

export const COMPARE_SEARCH_QUERY = gql`
  query CompareSearchProducts($query: String!, $page: Int, $limit: Int) {
    searchProducts(query: $query, page: $page, limit: $limit) {
      products {
        id
        name
        description
        features
        slug
        brand
        category {
          name
          categorySpecification {
            key
            label
          }
        }
        variants {
          price
          mrp
          attributes
          specifications {
            key
            value
          }
        }
        specificationTable
        images {
          altText
          url
          mediaType
        }
        reviews {
          rating
        }
      }
    }
  }
`;

export const GET_SEARCH_SUGGESTIONS = gql`
  query SearchSuggestions($query: String!) {
    searchSuggestions(query: $query)
  }
`;
