import gql from "graphql-tag";

export const MAKE_SEARCH_QUERY = gql`
  query SearchProducts($query: String!) {
    searchProducts(query: $query) {
      products {
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
        description
        brand
        slug
        category {
          name
        }
      }
    }
  }
`;
