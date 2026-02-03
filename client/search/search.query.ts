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
        specificationTable {
          rows
        }
        images {
          altText
          url
        }
        reviews {
          rating
        }
        deliveryOptions {
          title
        }
        brand {
          name
        }
        slug
        category {
          name
          categorySpecification {
            key
            label
            value
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
        brand {
          name
        }
        category {
          name
          categorySpecification {
            key
            label
            value
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
        specificationTable {
          rows
        }
        images {
          altText
          url
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
