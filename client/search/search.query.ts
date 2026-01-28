import gql from "graphql-tag";


export const MAKE_SEARCH_QUERY = gql`
  query SearchProducts($query: String!, $page: Int, $limit: Int) {
    searchProducts(query: $query, page: $page, limit: $limit) {
      products {
        id
        name
        variants {
          price
          mrp
          specifications {
            key
            value
          }
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
        brand
        slug
        category {
          name
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

export const GET_SEARCH_SUGGESTIONS = gql`
  query SearchSuggestions($query: String!) {
    searchSuggestions(query: $query)
  }
`;
