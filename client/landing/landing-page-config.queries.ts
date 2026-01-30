import { gql } from '@apollo/client';

export const GET_LANDING_PAGE_CATEGORY_CARDS = gql`
  query GetLandingPageCategoryCards {
    getLandingPageCategoryCards {
      id
      categoryId
      categoryName
      categorySlug
      image
      count
      color
      darkColor
      sortOrder
      isActive
    }
  }
`;

export const GET_LANDING_PAGE_CATEGORY_SWIPERS = gql`
  query GetLandingPageCategorySwipers {
    getLandingPageCategorySwipers {
      id
      title
      category
      sortOrder
      isActive
    }
  }
`;

export const GET_LANDING_PAGE_PRODUCT_GRIDS = gql`
  query GetLandingPageProductGrids {
    getLandingPageProductGrids {
      id
      title
      topDealAbout
      productIds
      sortOrder
      isActive
    }
  }
`;
