import { gql } from "@apollo/client";

export const UPDATE_USER_PROFILE_DETAILS = gql`
  mutation UpdateUserProfileDetails($input: UpdateUserProfileDetailsInput) {
    updateUserProfileDetails(input: $input) {
      id
      firstName
      lastName
      phoneNumber
      gender
      dob
    }
  }
`;
