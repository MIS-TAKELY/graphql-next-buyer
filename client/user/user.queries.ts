import gql from "graphql-tag";

export const GET_USER_PROFILE_DETAILS = gql`
  query GetUserProfileDetails {
    getUserProfileDetails {
      id
      firstName
      email
      lastName
      phoneNumber
      gender
      dob
      emailNotifications
      whatsappNotifications
      inAppNotifications
      addresses {
        id
        type
        label
        line1
        line2
        city
        state
        country
        postalCode
        phone
        isDefault
      }
    }
  }
`;
