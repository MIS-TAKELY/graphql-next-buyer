import gql from "graphql-tag";

export const GET_MY_WISHLISTS = gql`
  query MyWishlists {
    myWishlists {
      items {
        id
        wishlistId
        product {
          id
          name
          variants {
            id
            price
          }
          images {
            url
          }
        }
      }
    }
  }
`;
