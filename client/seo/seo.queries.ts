import { gql } from "@apollo/client";

export const GET_SEO_PAGE_BY_PATH = gql`
  query GetSeoPageByPath($path: String!) {
    seoPageByPath(path: $path) {
      id
      urlPath
      categoryId
      priceThreshold
      metaTitle
      metaDescription
      structuredData
      category {
        id
        name
        slug
        description
      }
    }
  }
`;
