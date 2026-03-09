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
      pinnedProductIds
      pinnedProducts {
        id
        name
        slug
        brand
        description
        status
        images {
          id
          url
          altText
          mediaType
        }
        variants {
          id
          price
          mrp
          stock
          isDefault
          specifications {
            key
            value
          }
        }
        reviews {
          id
          rating
        }
        category {
          id
          name
        }
        productOffers {
          id
          offer {
            type
            value
            isActive
          }
        }
      }
    }
  }
`;
