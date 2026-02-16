import gql from "graphql-tag";

export const GET_ADDRESS_OF_USER = gql`
  query GetAddressOfUser {
    getAddressOfUser {
      id
      type
      label
      line1
      line2
      city
      state
      country
      postalCode
      phoneNumber
      isDefault
    }
  }
`;
