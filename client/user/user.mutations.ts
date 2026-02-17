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

export const UPDATE_NOTIFICATION_PREFERENCES = gql`
  mutation UpdateNotificationPreferences($input: UpdateNotificationPreferencesInput!) {
    updateNotificationPreferences(input: $input) {
      id
      emailNotifications
      whatsappNotifications
      inAppNotifications
    }
  }
`;
