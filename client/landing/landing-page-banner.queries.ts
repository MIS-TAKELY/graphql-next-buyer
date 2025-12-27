import { gql } from "@apollo/client";

export const GET_LANDING_PAGE_BANNERS = gql`
  query GetLandingPageBanners {
    getLandingPageBanners {
      id
      title
      description
      imageUrl
      link
      sortOrder
      isActive
      mediaType
    }
  }
`;
