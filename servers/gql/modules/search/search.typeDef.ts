import gql from "graphql-tag";

export const searchTypeDef = gql `
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

  "Simple label + count used for brand or category filters"
  type FilterOption {
    name: String!
    count: Int!
  }

  "Used for category filters, includes ID"
  type CategoryFilter {
    id: ID!
    name: String
    count: Int!
  }

  "Specification option for product feature key/value pairs"
  type SpecificationOption {
    value: String!
    count: Int!
  }

  "Price range filter"
  type PriceRange {
    min: Float
    max: Float
  }

  "Stock summary filter"
  type StockInfo {
    totalStock: Int
  }

  "Dynamic filters built from current search results"
  type SearchFiltersResult {
    brands: [FilterOption!]!
    categories: [CategoryFilter!]!
    specifications: Json
    price: PriceRange
    stock: StockInfo
  }

  "Pagination-aware search result with dynamic filters"
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
  }

  type IndexResult {
    indexed: Int!
    errors: Boolean!
  }
`;
