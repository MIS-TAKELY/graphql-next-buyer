import { opensearchClient, PRODUCT_INDEX } from "../config/opensearch.config";
import { embeddingService } from "./embedding.services";
import { openSearchIndexService } from "./opensearch-index.services";

interface SearchFilters {
  categories?: string[];
  brands?: string[];
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  inStock?: boolean;
  sellerId?: string;
}

interface SearchOptions {
  query: string;
  filters?: SearchFilters;
  sortBy?: "relevance" | "price_asc" | "price_desc" | "rating" | "newest";
  page?: number;
  limit?: number;
  enableSemantic?: boolean;
  enableFuzzy?: boolean;
}


export class ProductSearchService {
  async search(options: SearchOptions) {
    const {
      query,
      filters = {},
      sortBy = "relevance",
      page = 1,
      limit = 20,
      enableSemantic = true,
      enableFuzzy = true,
    } = options;

    const from = (page - 1) * limit;

    // Build filter conditions
    const filterConditions = [];

    if (filters.categories?.length) {
      filterConditions.push({
        terms: { "category.id": filters.categories },
      });
    }

    if (filters.brands?.length) {
      filterConditions.push({
        terms: { "brand.keyword": filters.brands },
      });
    }

    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      filterConditions.push({
        range: {
          price: {
            ...(filters.minPrice !== undefined && { gte: filters.minPrice }),
            ...(filters.maxPrice !== undefined && { lte: filters.maxPrice }),
          },
        },
      });
    }

    if (filters.minRating !== undefined) {
      filterConditions.push({
        range: { rating: { gte: filters.minRating } },
      });
    }

    if (filters.inStock) {
      filterConditions.push({
        range: { stock: { gt: 0 } },
      });
    }

    if (filters.sellerId) {
      filterConditions.push({
        term: { sellerId: filters.sellerId },
      });
    }

    // Always add status filter
    filterConditions.push({
      term: { status: "ACTIVE" },
    });

    // Build sort
    let sort: any[] = [];
    switch (sortBy) {
      case "price_asc":
        sort = [{ price: "asc" }];
        break;
      case "price_desc":
        sort = [{ price: "desc" }];
        break;
      case "rating":
        sort = [{ rating: "desc" }, { reviewCount: "desc" }];
        break;
      case "newest":
        sort = [{ createdAt: "desc" }];
        break;
      default:
        sort = ["_score"];
    }

    // Check if we should use KNN search
    const hasKNNSupport = openSearchIndexService.getKNNSupport();
    const shouldUseKNN =
      enableSemantic && hasKNNSupport && query && query.trim();

    if (shouldUseKNN) {
      // Use KNN search with script_score
      return await this.knnSearch(query, filterConditions, from, limit, sort);
    } else {
      // Use traditional text search
      return await this.textSearch(
        query,
        filterConditions,
        from,
        limit,
        sort,
        enableFuzzy
      );
    }
  }

  private async textSearch(
    query: string,
    filterConditions: any[],
    from: number,
    limit: number,
    sort: any[],
    enableFuzzy: boolean
  ) {
    const shouldClauses = [];

    if (query && query.trim()) {
      // Exact match gets highest score

      shouldClauses.push({
        match_phrase: {
          name: {
            query,
            boost: 10,
          },
        },
      });

      // Multi-match across fields
      shouldClauses.push({
        multi_match: {
          query,
          fields: ["name^5", "brand^3", "category.name^2", "description"],
          type: "best_fields",
          tie_breaker: 0.3,
          boost: 5,
        },
      });


      // Fuzzy matching for typo tolerance
      if (enableFuzzy) {
        shouldClauses.push({
          multi_match: {
            query,
            fields: ["name^3", "brand^2", "description"],
            fuzziness: "AUTO",
            prefix_length: 1,
            max_expansions: 50,
            boost: 2,
          },
        });

        // Add individual fuzzy matches for better control
        const terms = query.toLowerCase().split(/\s+/);
        terms.forEach((term) => {
          if (term.length > 2) {
            shouldClauses.push({
              fuzzy: {
                name: {
                  value: term,
                  fuzziness: "AUTO",
                  prefix_length: 1,
                  boost: 1,
                },
              },
            });
          }
        });
      }

      // Add wildcard search for partial matches
      shouldClauses.push({
        wildcard: {
          name: {
            value: `*${query.toLowerCase()}*`,
            boost: 0.5,
          },
        },
      });
    }

    const searchBody = {
      from,
      size: limit,
      sort,
      query:
        shouldClauses.length > 0
          ? {
              bool: {
                should: shouldClauses,
                filter: filterConditions,
                minimum_should_match: 1,
              },
            }
          : {
              bool: {
                filter: filterConditions,
              },
            },
      aggs: this.buildAggregations(),
      highlight: {
        fields: {
          name: {},
          description: {},
        },
        pre_tags: ["<mark>"],
        post_tags: ["</mark>"],
      },
    };

    try {
      const response = await opensearchClient.search({
        index: PRODUCT_INDEX,
        body: searchBody,
      });

      return this.formatSearchResponse(response.body, from / limit + 1, limit);
    } catch (error) {
      console.error("Text search error:", error);
      throw error;
    }
  }

  private async knnSearch(
    query: string,
    filterConditions: any[],
    from: number,
    limit: number,
    sort: any[]
  ) {
    try {
      // Generate embedding for the query
      const queryEmbedding = await embeddingService.generateEmbedding(query);

      // Use script_score query for KNN search
      const searchBody = {
        from,
        size: limit,
        query: {
          script_score: {
            query: {
              bool: {
                filter: filterConditions,
              },
            },
            script: {
              source:
                "cosineSimilarity(params.query_vector, 'embedding') + 1.0",
              params: {
                query_vector: queryEmbedding,
              },
            },
          },
        },
        sort: sort[0] === "_score" ? ["_score"] : sort,
        aggs: this.buildAggregations(),
      };

      const response = await opensearchClient.search({
        index: PRODUCT_INDEX,
        body: searchBody,
      });

      return this.formatSearchResponse(response.body, from / limit + 1, limit);
    } catch (error) {
      console.error("KNN search error, falling back to text search:", error);
      // Fall back to text search if KNN fails
      return await this.textSearch(
        query,
        filterConditions,
        from,
        limit,
        sort,
        true
      );
    }
  }

  private buildAggregations() {
    return {
      categories: {
        terms: {
          field: "category.id",
          size: 20,
        },
      },
      brands: {
        terms: {
          field: "brand.keyword",
          size: 20,
        },
      },
      price_ranges: {
        range: {
          field: "price",
          ranges: [
            { key: "Under $100", to: 100 },
            { key: "$100 - $500", from: 100, to: 500 },
            { key: "$500 - $1000", from: 500, to: 1000 },
            { key: "$1000 - $5000", from: 1000, to: 5000 },
            { key: "Over $5000", from: 5000 },
          ],
        },
      },
      avg_price: { avg: { field: "price" } },
      min_price: { min: { field: "price" } },
      max_price: { max: { field: "price" } },
    };
  }

  async suggest(query: string, limit = 10) {
    try {
      const response = await opensearchClient.search({
        index: PRODUCT_INDEX,
        body: {
          suggest: {
            product_suggest: {
              prefix: query,
              completion: {
                field: "name.suggest",
                size: limit,
                skip_duplicates: true,
                fuzzy: {
                  fuzziness: "AUTO",
                },
              },
            },
          },
          _source: false,
        },
      });

      if (response.body.suggest?.product_suggest?.[0]?.options) {
        return response.body.suggest.product_suggest[0].options.map(
          (option: any) => ({
            text: option.text,
            score: option._score,
          })
        );
      }

      // Fallback to regular search if suggestions don't work
      const fallbackResponse = await opensearchClient.search({
        index: PRODUCT_INDEX,
        body: {
          size: limit,
          query: {
            multi_match: {
              query,
              fields: ["name^2", "brand"],
              type: "phrase_prefix",
            },
          },
          _source: ["name"],
        },
      });

      return fallbackResponse.body.hits.hits.map((hit: any) => ({
        text: hit._source.name,
        score: hit._score,
      }));
    } catch (error) {
      console.error("Suggestion error:", error);
      return [];
    }
  }

  async moreLikeThis(productId: string, limit = 10) {
    try {
      const response = await opensearchClient.search({
        index: PRODUCT_INDEX,
        body: {
          size: limit,
          query: {
            more_like_this: {
              fields: ["name", "description", "brand", "category.name"],
              like: [
                {
                  _index: PRODUCT_INDEX,
                  _id: productId,
                },
              ],
              min_term_freq: 1,
              min_doc_freq: 1,
              max_query_terms: 12,
            },
          },
        },
      });

      return this.formatSearchResponse(response.body, 1, limit);
    } catch (error) {
      console.error("More like this error:", error);
      // Fallback: get products from same category
      const product = await opensearchClient.get({
        index: PRODUCT_INDEX,
        id: productId,
      });

      if (product.body._source?.category?.id) {
        const fallbackResponse = await opensearchClient.search({
          index: PRODUCT_INDEX,
          body: {
            size: limit,
            query: {
              bool: {
                filter: [
                  { term: { "category.id": product.body._source.category.id } },
                  { term: { status: "ACTIVE" } },
                ],
                must_not: [{ term: { id: productId } }],
              },
            },
          },
        });

        return this.formatSearchResponse(fallbackResponse.body, 1, limit);
      }

      return {
        products: [],
        pagination: { page: 1, limit, total: 0, totalPages: 0 },
        facets: {
          categories: [],
          brands: [],
          priceRanges: [],
          priceStats: { avg: 0, min: 0, max: 0 },
        },
      };
    }
  }

  private formatSearchResponse(response: any, page: number, limit: number) {
    const hits = response.hits.hits.map((hit: any) => ({
      ...hit._source,
      _score: hit._score,
      _id: hit._id,
      highlights: hit.highlight,
    }));

    const aggregations = response.aggregations || {};

    return {
      products: hits,
      pagination: {
        page,
        limit,
        total: response.hits.total?.value || response.hits.total || 0,
        totalPages: Math.ceil(
          (response.hits.total?.value || response.hits.total || 0) / limit
        ),
      },
      facets: {
        categories: aggregations.categories?.buckets || [],
        brands: aggregations.brands?.buckets || [],
        priceRanges: aggregations.price_ranges?.buckets || [],
        priceStats: {
          avg: aggregations.avg_price?.value || 0,
          min: aggregations.min_price?.value || 0,
          max: aggregations.max_price?.value || 0,
        },
      },
    };
  }
}

export const productSearchService = new ProductSearchService();
