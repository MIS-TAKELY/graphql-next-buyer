import { gql } from "@apollo/client";

export const GET_CATEGORY_BY_SLUG = gql`
  query GetCategoryBySlug($slug: String!) {
    categoryBySlug(slug: $slug) {
      id
      name
      slug
      description
      metaTitle
      metaDescription
      keywords
    }
  }
`;
