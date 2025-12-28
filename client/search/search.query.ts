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
        brand
        slug
        category {
          name
        }
      }
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
