export const searchTypeDef = /* GraphQL */ `
  type SearchProduct {
    id: ID!
    name: String!
    description: String
    brand: String!
    category: ProductCategory
    price: Float!
    mrp: Float!
    discount: Float!
    status: String!
    sellerId: String!
    sellerName: String!
    rating: Float!
    reviewCount: Int!
    stock: Int!
    images: [ProductImageResult!]!
    specifications: [ProductSpecification!]!
    score: Float
    createdAt: String!
    updatedAt: String!
  }

  type ProductCategory {
    id: ID!
    name: String!
    slug: String!
  }

  type ProductImageResult {
    url: String!
    altText: String
  }

  type ProductSpecification {
    key: String!
    value: String!
  }

  type SearchPagination {
    page: Int!
    limit: Int!
    total: Int!
    totalPages: Int!
  }

  type FacetBucket {
    key: String!
    doc_count: Int!
  }

  type PriceRangeBucket {
    key: String!
    from: Float
    to: Float
    doc_count: Int!
  }

  type PriceStats {
    avg: Float!
    min: Float!
    max: Float!
  }

  type SearchFacets {
    categories: [FacetBucket!]!
    brands: [FacetBucket!]!
    priceRanges: [PriceRangeBucket!]!
    priceStats: PriceStats!
  }

  type SearchResult {
    products: [SearchProduct!]!
    pagination: SearchPagination!
    facets: SearchFacets!
    name: String
  }

  type SearchSuggestion {
    text: String!
    score: Float!
  }

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

    searchSuggestions(query: String!, limit: Int): [SearchSuggestion!]!

    similarProducts(productId: String!, limit: Int): SearchResult!
  }

  type Mutation {
    indexProduct(productId: String!): Boolean!
    indexAllProducts(limit: Int, offset: Int): IndexResult!
    removeProductFromIndex(productId: String!): Boolean!
    recreateSearchIndex: Boolean!
  }

  type IndexResult {
    indexed: Int!
    errors: Boolean!
  }
`;
