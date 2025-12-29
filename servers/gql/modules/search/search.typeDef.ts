import gql from "graphql-tag";

export const searchTypeDef = gql`
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

  type FilterOption {
    name: String!
    count: Int!
  }

  type CategoryFilter {
    id: ID!
    name: String
    count: Int!
  }

  type SpecificationOption {
    value: String!
    count: Int!
  }

  type PriceRange {
    min: Float
    max: Float
  }

  type StockInfo {
    totalStock: Int
  }

  type SearchFiltersResult {
    brands: [FilterOption!]!
    categories: [CategoryFilter!]!
    specifications: Json
    price: PriceRange
    stock: StockInfo
    delivery: [FilterOption!]!
  }

  type SearchResult {
    products: [Product!]!
    pagination: SearchPagination!
    filters: SearchFiltersResult!
  }

  type Query {
    searchProducts(
      query: String!
      filters: SearchFilters
      sortBy: SearchSortBy
      page: Int
      limit: Int
      enableSemantic: Boolean
      enableFuzzy: Boolean
    ): SearchResult!

    searchSuggestions(query: String!): [String!]!
  }

  type IndexResult {
    indexed: Int!
    errors: Boolean!
  }
`;
