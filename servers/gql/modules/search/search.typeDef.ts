export const searchTypeDef = /* GraphQL */ `
  input SearchFilters {
    categories: [String!]
    brands: [String!]
    minPrice: Float
    maxPrice: Float
    minRating: Float
    inStock: Boolean
    sellerId: String
  }

  enum SearchSortBy {
    relevance
    price_asc
    price_desc
    rating
    newest
  }

  type SearchPagination {
    page: Int!
    limit: Int!
    total: Int!
    totalPages: Int!
  }

  type SearchResult {
    products: [Product!]!
    pagination: SearchPagination!
  }

  type Query {
    searchProducts(
      query: String!
      #filters: SearchFilters
      sortBy: SearchSortBy
      page: Int
      limit: Int
      enableSemantic: Boolean
      enableFuzzy: Boolean
    ): SearchResult!
  }

  type IndexResult {
    indexed: Int!
    errors: Boolean!
  }
`;
