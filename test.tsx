// import {
//   EMBEDDING_DIMENSION,
//   opensearchClient,
//   PRODUCT_INDEX,
// } from "../config/opensearch.config";

// export class OpenSearchIndexService {
//   private supportsKNN = false;

//   async checkKNNSupport(): Promise<boolean> {
//     try {
//       const response = await opensearchClient.cat.plugins({
//         format: "json",
//       });

//       this.supportsKNN = response.body.some(
//         (plugin: any) =>
//           plugin.component?.toLowerCase().includes("knn") ||
//           plugin.name?.toLowerCase().includes("knn")
//       );

//       console.log("KNN Support:", this.supportsKNN);
//       return this.supportsKNN;
//     } catch (error) {
//       console.log("Could not check KNN support, assuming not available");
//       return false;
//     }
//   }

//   async createProductIndex() {
//     const indexExists = await opensearchClient.indices.exists({
//       index: PRODUCT_INDEX,
//     });

//     if (indexExists.body) {
//       console.log(`Index ${PRODUCT_INDEX} already exists`);
//       return;
//     }

//     // Check for KNN support
//     const hasKNN = await this.checkKNNSupport();

//     if (hasKNN) {
//       console.log("supports Knn");
//     } else {
//       console.log("doestsupport Knn");
//     }

//     const mappings: any = {
//       properties: {
//         id: { type: "keyword" },
//         name: {
//           type: "text",
//           analyzer: "standard",
//           fields: {
//             keyword: { type: "keyword" },
//             suggest: {
//               type: "completion",
//             },
//           },
//         },
//         description: {
//           type: "text",
//           analyzer: "standard",
//         },
//         brand: {
//           type: "text",
//           fields: {
//             keyword: { type: "keyword" },
//           },
//         },
//         category: {
//           type: "object",
//           properties: {
//             id: { type: "keyword" },
//             name: { type: "text" },
//             slug: { type: "keyword" },
//           },
//         },
//         price: {
//           type: "scaled_float",
//           scaling_factor: 100,
//         },
//         mrp: {
//           type: "scaled_float",
//           scaling_factor: 100,
//         },
//         discount: { type: "float" },
//         status: { type: "keyword" },
//         sellerId: { type: "keyword" },
//         sellerName: { type: "text" },
//         rating: { type: "float" },
//         reviewCount: { type: "integer" },
//         stock: { type: "integer" },
//         images: {
//           type: "nested",
//           properties: {
//             url: { type: "keyword" },
//             altText: { type: "text" },
//           },
//         },
//         specifications: {
//           type: "nested",
//           properties: {
//             key: { type: "keyword" },
//             value: { type: "text" },
//           },
//         },
//         createdAt: { type: "date" },
//         updatedAt: { type: "date" },
//       },
//     };

//     // Only add embedding field if KNN is supported
//     if (hasKNN) {
//       mappings.properties.embedding = {
//         type: "knn_vector",
//         dimension: EMBEDDING_DIMENSION,
//         method: {
//           name: "hnsw",
//           space_type: "cosinesimil",
//           engine: "faiss",
//           parameters: {
//             ef_construction: 128,
//             m: 24,
//           },
//         },
//       };
//     }

//     // Build settings
//     const settings: any = {
//       number_of_shards: 2,
//       number_of_replicas: 1,
//       analysis: {
//         analyzer: {
//           product_analyzer: {
//             type: "custom",
//             tokenizer: "standard",
//             filter: ["lowercase", "asciifolding", "synonym_filter"],
//           },
//         },
//         filter: {
//           synonym_filter: {
//             type: "synonym",
//             synonyms: [
//               "laptop,notebook,computer",
//               "phone,mobile,smartphone,cellphone,iphone",
//               "headphone,earphone,headset,earbuds",
//               "tv,television,smart tv",
//               "watch,smartwatch",
//               "tablet,ipad,tab",
//             ],
//           },
//         },
//       },
//     };

//     // Only add KNN settings if supported
//     if (hasKNN) {
//       settings["index.knn"] = true;
//     }

//     try {
//       await opensearchClient.indices.create({
//         index: PRODUCT_INDEX,
//         body: {
//           settings,
//           mappings,
//         },
//       });

//       console.log(
//         `Index ${PRODUCT_INDEX} created successfully (KNN: ${hasKNN})`
//       );
//     } catch (error: any) {
//       console.error(
//         "Failed to create index:",
//         error.meta?.body?.error || error
//       );
//       throw error;
//     }
//   }

//   async deleteIndex() {
//     try {
//       const indexExists = await opensearchClient.indices.exists({
//         index: PRODUCT_INDEX,
//       });

//       if (indexExists.body) {
//         await opensearchClient.indices.delete({
//           index: PRODUCT_INDEX,
//         });
//         console.log(`Index ${PRODUCT_INDEX} deleted`);
//       }
//     } catch (error) {
//       console.error("Failed to delete index:", error);
//       throw error;
//     }
//   }

//   getKNNSupport(): boolean {
//     return this.supportsKNN;
//   }
// }

// export const openSearchIndexService = new OpenSearchIndexService();
//   import { pipeline, Pipeline } from '@xenova/transformers';

// class EmbeddingService {
//   private extractor: Pipeline | null = null;

//   async initialize() {
//     if (!this.extractor) {
//       // Using all-MiniLM-L6-v2 for 384-dimensional embeddings
//       this.extractor = await pipeline(
//         'feature-extraction',
//         'Xenova/all-MiniLM-L6-v2'
//       );
//     }
//   }

//   async generateEmbedding(text: string): Promise<number[]> {
//     await this.initialize();
    
//     if (!this.extractor) {
//       throw new Error('Embedding extractor not initialized');
//     }

//     const output = await this.extractor(text, {
//       pooling: 'mean',
//       normalize: true,
//     });

//     return Array.from(output.data as Float32Array);
//   }

//   async generateBatchEmbeddings(texts: string[]): Promise<number[][]> {
//     const embeddings = await Promise.all(
//       texts.map(text => this.generateEmbedding(text))
//     );
//     return embeddings;
//   }
// }

// export const embeddingService = new EmbeddingService();  import { PrismaClient } from "@/app/generated/prisma";
// import { opensearchClient, PRODUCT_INDEX } from "../config/opensearch.config";
// import { openSearchIndexService } from "./opensearch-index.services";
// import { embeddingService } from "./embedding.services";

// const prisma = new PrismaClient();

// export class ProductIndexingService {
//   async indexProduct(productId: string) {
//     const product = await prisma.product.findUnique({
//       where: { id: productId },
//       include: {
//         category: true,
//         variants: {
//           include: {
//             specifications: true,
//           },
//         },
//         images: true,
//         reviews: {
//           where: { status: "APPROVED" },
//         },
//         seller: true,
//       },
//     });

//     if (!product) {
//       throw new Error(`Product ${productId} not found`);
//     }

//     // Calculate aggregated data
//     const minPrice = Math.min(...product.variants.map((v) => Number(v.price)));
//     const maxPrice = Math.max(...product.variants.map((v) => Number(v.price)));
//     const totalStock = product.variants.reduce((sum, v) => sum + v.stock, 0);
//     const avgRating =
//       product.reviews.length > 0
//         ? product.reviews.reduce((sum, r) => sum + r.rating, 0) /
//           product.reviews.length
//         : 0;

//     // Prepare specifications from all variants
//     const specifications = product.variants.flatMap((v) =>
//       v.specifications.map((spec) => ({
//         key: spec.key,
//         value: spec.value,
//       }))
//     );

//     const document: any = {
//       id: product.id,
//       name: product.name,
//       description: product.description,
//       brand: product.brand,
//       category: product.category
//         ? {
//             id: product.category.id,
//             name: product.category.name,
//             slug: product.category.slug,
//           }
//         : null,
//       price: minPrice,
//       mrp: Math.max(...product.variants.map((v) => Number(v.mrp))),
//       discount: maxPrice > 0 ? ((maxPrice - minPrice) / maxPrice) * 100 : 0,
//       status: product.status,
//       sellerId: product.sellerId,
//       sellerName:
//         `${product.seller.firstName || ""} ${
//           product.seller.lastName || ""
//         }`.trim() || "Unknown Seller",
//       rating: avgRating,
//       reviewCount: product.reviews.length,
//       stock: totalStock,
//       images: product.images.map((img) => ({
//         url: img.url,
//         altText: img.altText,
//       })),
//       specifications,
//       createdAt: product.createdAt,
//       updatedAt: product.updatedAt,
//     };

//     // Only generate embedding if KNN is supported
//     if (openSearchIndexService.getKNNSupport()) {
//       const searchText = `${product.name} ${product.description || ""} ${
//         product.brand
//       } ${product.category?.name || ""}`;
//       try {
//         document.embedding = await embeddingService.generateEmbedding(
//           searchText
//         );
//       } catch (error) {
//         console.warn("Failed to generate embedding:", error);
//         // Continue without embedding
//       }
//     }

//     await opensearchClient.index({
//       index: PRODUCT_INDEX,
//       id: product.id,
//       body: document,
//       refresh: true,
//     });

//     return document;
//   }

//   async bulkIndexProducts(limit = 100, offset = 0) {
//     const products = await prisma.product.findMany({
//       where: { status: "ACTIVE" },
//       skip: offset,
//       take: limit,
//       include: {
//         category: true,
//         variants: {
//           include: {
//             specifications: true,
//           },
//         },
//         images: true,
//         reviews: {
//           where: { status: "APPROVED" },
//         },
//         seller: true,
//       },
//     });

//     if (products.length === 0) {
//       return { indexed: 0, errors: false };
//     }

//     const bulkOperations = [];
//     const hasKNN = openSearchIndexService.getKNNSupport();

//     for (const product of products) {
//       try {
//         const minPrice =
//           product.variants.length > 0
//             ? Math.min(...product.variants.map((v) => Number(v.price)))
//             : 0;
//         const maxPrice =
//           product.variants.length > 0
//             ? Math.max(...product.variants.map((v) => Number(v.price)))
//             : 0;
//         const totalStock = product.variants.reduce(
//           (sum, v) => sum + v.stock,
//           0
//         );
//         const avgRating =
//           product.reviews.length > 0
//             ? product.reviews.reduce((sum, r) => sum + r.rating, 0) /
//               product.reviews.length
//             : 0;

//         const specifications = product.variants.flatMap((v) =>
//           v.specifications.map((spec) => ({
//             key: spec.key,
//             value: spec.value,
//           }))
//         );

//         const document: any = {
//           id: product.id,
//           name: product.name,
//           description: product.description,
//           brand: product.brand,
//           category: product.category
//             ? {
//                 id: product.category.id,
//                 name: product.category.name,
//                 slug: product.category.slug,
//               }
//             : null,
//           price: minPrice,
//           mrp:
//             product.variants.length > 0
//               ? Math.max(...product.variants.map((v) => Number(v.mrp)))
//               : 0,
//           discount: maxPrice > 0 ? ((maxPrice - minPrice) / maxPrice) * 100 : 0,
//           status: product.status,
//           sellerId: product.sellerId,
//           sellerName:
//             `${product.seller.firstName || ""} ${
//               product.seller.lastName || ""
//             }`.trim() || "Unknown Seller",
//           rating: avgRating,
//           reviewCount: product.reviews.length,
//           stock: totalStock,
//           images: product.images.map((img) => ({
//             url: img.url,
//             altText: img.altText,
//           })),
//           specifications,
//           createdAt: product.createdAt,
//           updatedAt: product.updatedAt,
//         };

//         // Only generate embedding if KNN is supported
//         if (hasKNN) {
//           const searchText = `${product.name} ${product.description || ""} ${
//             product.brand
//           } ${product.category?.name || ""}`;
//           try {
//             document.embedding = await embeddingService.generateEmbedding(
//               searchText
//             );
//           } catch (error) {
//             console.warn(
//               `Failed to generate embedding for product ${product.id}:`,
//               error
//             );
//             // Continue without embedding
//           }
//         }

//         bulkOperations.push(
//           { index: { _index: PRODUCT_INDEX, _id: product.id } },
//           document
//         );
//       } catch (error) {
//         console.error(`Error processing product ${product.id}:`, error);
//         // Skip this product and continue
//       }
//     }

//     if (bulkOperations.length > 0) {
//       try {
//         const response = await opensearchClient.bulk({
//           body: bulkOperations,
//           refresh: true,
//         });

//         if (response.body.errors) {
//           console.error(
//             "Bulk indexing errors:",
//             response.body.items
//               .filter((item: any) => item.index?.error)
//               .map((item: any) => item.index.error)
//           );
//         }

//         return {
//           indexed: products.length,
//           errors: response.body.errors,
//         };
//       } catch (error) {
//         console.error("Bulk operation failed:", error);
//         return {
//           indexed: 0,
//           errors: true,
//         };
//       }
//     }

//     return { indexed: 0, errors: false };
//   }

//   async removeFromIndex(productId: string) {
//     try {
//       await opensearchClient.delete({
//         index: PRODUCT_INDEX,
//         id: productId,
//         refresh: true,
//       });
//     } catch (error: any) {
//       if (error.meta?.statusCode === 404) {
//         console.log(`Product ${productId} not found in index`);
//       } else {
//         throw error;
//       }
//     }
//   }
// }

// export const productIndexingService = new ProductIndexingService();
//   import { opensearchClient, PRODUCT_INDEX } from '../config/opensearch.config';
// import { embeddingService } from './embedding.services';
// import { openSearchIndexService } from './opensearch-index.services';

// interface SearchFilters {
//   categories?: string[];
//   brands?: string[];
//   minPrice?: number;
//   maxPrice?: number;
//   minRating?: number;
//   inStock?: boolean;
//   sellerId?: string;
// }

// interface SearchOptions {
//   query: string;
//   filters?: SearchFilters;
//   sortBy?: 'relevance' | 'price_asc' | 'price_desc' | 'rating' | 'newest';
//   page?: number;
//   limit?: number;
//   enableSemantic?: boolean;
//   enableFuzzy?: boolean;
// }

// export class ProductSearchService {
//   async search(options: SearchOptions) {
//     const {
//       query,
//       filters = {},
//       sortBy = 'relevance',
//       page = 1,
//       limit = 20,
//       enableSemantic = true,
//       enableFuzzy = true,
//     } = options;

//     const from = (page - 1) * limit;
    
//     // Build filter conditions
//     const filterConditions = [];
    
//     if (filters.categories?.length) {
//       filterConditions.push({
//         terms: { 'category.id': filters.categories },
//       });
//     }
    
//     if (filters.brands?.length) {
//       filterConditions.push({
//         terms: { 'brand.keyword': filters.brands },
//       });
//     }
    
//     if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
//       filterConditions.push({
//         range: {
//           price: {
//             ...(filters.minPrice !== undefined && { gte: filters.minPrice }),
//             ...(filters.maxPrice !== undefined && { lte: filters.maxPrice }),
//           },
//         },
//       });
//     }
    
//     if (filters.minRating !== undefined) {
//       filterConditions.push({
//         range: { rating: { gte: filters.minRating } },
//       });
//     }
    
//     if (filters.inStock) {
//       filterConditions.push({
//         range: { stock: { gt: 0 } },
//       });
//     }
    
//     if (filters.sellerId) {
//       filterConditions.push({
//         term: { sellerId: filters.sellerId },
//       });
//     }

//     // Always add status filter
//     filterConditions.push({
//       term: { status: 'ACTIVE' },
//     });

//     // Build sort
//     let sort: any[] = [];
//     switch (sortBy) {
//       case 'price_asc':
//         sort = [{ price: 'asc' }];
//         break;
//       case 'price_desc':
//         sort = [{ price: 'desc' }];
//         break;
//       case 'rating':
//         sort = [{ rating: 'desc' }, { reviewCount: 'desc' }];
//         break;
//       case 'newest':
//         sort = [{ createdAt: 'desc' }];
//         break;
//       default:
//         sort = ['_score'];
//     }

//     // Check if we should use KNN search
//     const hasKNNSupport = openSearchIndexService.getKNNSupport();
//     const shouldUseKNN = enableSemantic && hasKNNSupport && query && query.trim();

//     if (shouldUseKNN) {
//       // Use KNN search with script_score
//       return await this.knnSearch(query, filterConditions, from, limit, sort);
//     } else {
//       // Use traditional text search
//       return await this.textSearch(query, filterConditions, from, limit, sort, enableFuzzy);
//     }
//   }

//   private async textSearch(
//     query: string,
//     filterConditions: any[],
//     from: number,
//     limit: number,
//     sort: any[],
//     enableFuzzy: boolean
//   ) {
//     const shouldClauses = [];
    
//     if (query && query.trim()) {
//       // Exact match gets highest score
//       shouldClauses.push({
//         match_phrase: {
//           name: {
//             query,
//             boost: 10,
//           },
//         },
//       });

//       // Multi-match across fields
//       shouldClauses.push({
//         multi_match: {
//           query,
//           fields: ['name^5', 'brand^3', 'category.name^2', 'description'],
//           type: 'best_fields',
//           tie_breaker: 0.3,
//           boost: 5,
//         },
//       });

//       // Fuzzy matching for typo tolerance
//       if (enableFuzzy) {
//         shouldClauses.push({
//           multi_match: {
//             query,
//             fields: ['name^3', 'brand^2', 'description'],
//             fuzziness: 'AUTO',
//             prefix_length: 1,
//             max_expansions: 50,
//             boost: 2,
//           },
//         });

//         // Add individual fuzzy matches for better control
//         const terms = query.toLowerCase().split(/\s+/);
//         terms.forEach(term => {
//           if (term.length > 2) {
//             shouldClauses.push({
//               fuzzy: {
//                 name: {
//                   value: term,
//                   fuzziness: 'AUTO',
//                   prefix_length: 1,
//                   boost: 1,
//                 },
//               },
//             });
//           }
//         });
//       }

//       // Add wildcard search for partial matches
//       shouldClauses.push({
//         wildcard: {
//           name: {
//             value: `*${query.toLowerCase()}*`,
//             boost: 0.5,
//           },
//         },
//       });
//     }

//     const searchBody = {
//       from,
//       size: limit,
//       sort,
//       query: shouldClauses.length > 0 ? {
//         bool: {
//           should: shouldClauses,
//           filter: filterConditions,
//           minimum_should_match: 1,
//         },
//       } : {
//         bool: {
//           filter: filterConditions,
//         },
//       },
//       aggs: this.buildAggregations(),
//       highlight: {
//         fields: {
//           name: {},
//           description: {},
//         },
//         pre_tags: ['<mark>'],
//         post_tags: ['</mark>'],
//       },
//     };

//     try {
//       const response = await opensearchClient.search({
//         index: PRODUCT_INDEX,
//         body: searchBody,
//       });

//       return this.formatSearchResponse(response.body, from / limit + 1, limit);
//     } catch (error) {
//       console.error('Text search error:', error);
//       throw error;
//     }
//   }

//   private async knnSearch(
//     query: string,
//     filterConditions: any[],
//     from: number,
//     limit: number,
//     sort: any[]
//   ) {
//     try {
//       // Generate embedding for the query
//       const queryEmbedding = await embeddingService.generateEmbedding(query);

//       // Use script_score query for KNN search
//       const searchBody = {
//         from,
//         size: limit,
//         query: {
//           script_score: {
//             query: {
//               bool: {
//                 filter: filterConditions,
//               },
//             },
//             script: {
//               source: "cosineSimilarity(params.query_vector, 'embedding') + 1.0",
//               params: {
//                 query_vector: queryEmbedding,
//               },
//             },
//           },
//         },
//         sort: sort[0] === '_score' ? ['_score'] : sort,
//         aggs: this.buildAggregations(),
//       };

//       const response = await opensearchClient.search({
//         index: PRODUCT_INDEX,
//         body: searchBody,
//       });

//       return this.formatSearchResponse(response.body, from / limit + 1, limit);
//     } catch (error) {
//       console.error('KNN search error, falling back to text search:', error);
//       // Fall back to text search if KNN fails
//       return await this.textSearch(query, filterConditions, from, limit, sort, true);
//     }
//   }

//   private buildAggregations() {
//     return {
//       categories: {
//         terms: {
//           field: 'category.id',
//           size: 20,
//         },
//       },
//       brands: {
//         terms: {
//           field: 'brand.keyword',
//           size: 20,
//         },
//       },
//       price_ranges: {
//         range: {
//           field: 'price',
//           ranges: [
//             { key: 'Under $100', to: 100 },
//             { key: '$100 - $500', from: 100, to: 500 },
//             { key: '$500 - $1000', from: 500, to: 1000 },
//             { key: '$1000 - $5000', from: 1000, to: 5000 },
//             { key: 'Over $5000', from: 5000 },
//           ],
//         },
//       },
//       avg_price: { avg: { field: 'price' } },
//       min_price: { min: { field: 'price' } },
//       max_price: { max: { field: 'price' } },
//     };
//   }

//   async suggest(query: string, limit = 10) {
//     try {
//       const response = await opensearchClient.search({
//         index: PRODUCT_INDEX,
//         body: {
//           suggest: {
//             product_suggest: {
//               prefix: query,
//               completion: {
//                 field: 'name.suggest',
//                 size: limit,
//                 skip_duplicates: true,
//                 fuzzy: {
//                   fuzziness: 'AUTO',
//                 },
//               },
//             },
//           },
//           _source: false,
//         },
//       });

//       if (response.body.suggest?.product_suggest?.[0]?.options) {
//         return response.body.suggest.product_suggest[0].options.map((option: any) => ({
//           text: option.text,
//           score: option._score,
//         }));
//       }

//       // Fallback to regular search if suggestions don't work
//       const fallbackResponse = await opensearchClient.search({
//         index: PRODUCT_INDEX,
//         body: {
//           size: limit,
//           query: {
//             multi_match: {
//               query,
//               fields: ['name^2', 'brand'],
//               type: 'phrase_prefix',
//             },
//           },
//           _source: ['name'],
//         },
//       });

//       return fallbackResponse.body.hits.hits.map((hit: any) => ({
//         text: hit._source.name,
//         score: hit._score,
//       }));
//     } catch (error) {
//       console.error('Suggestion error:', error);
//       return [];
//     }
//   }

//   async moreLikeThis(productId: string, limit = 10) {
//     try {
//       const response = await opensearchClient.search({
//         index: PRODUCT_INDEX,
//         body: {
//           size: limit,
//           query: {
//             more_like_this: {
//               fields: ['name', 'description', 'brand', 'category.name'],
//               like: [
//                 {
//                   _index: PRODUCT_INDEX,
//                   _id: productId,
//                 },
//               ],
//               min_term_freq: 1,
//               min_doc_freq: 1,
//               max_query_terms: 12,
//             },
//           },
//         },
//       });

//       return this.formatSearchResponse(response.body, 1, limit);
//     } catch (error) {
//       console.error('More like this error:', error);
//       // Fallback: get products from same category
//       const product = await opensearchClient.get({
//         index: PRODUCT_INDEX,
//         id: productId,
//       });

//       if (product.body._source?.category?.id) {
//         const fallbackResponse = await opensearchClient.search({
//           index: PRODUCT_INDEX,
//           body: {
//             size: limit,
//             query: {
//               bool: {
//                 filter: [
//                   { term: { 'category.id': product.body._source.category.id } },
//                   { term: { status: 'ACTIVE' } },
//                 ],
//                 must_not: [
//                   { term: { id: productId } },
//                 ],
//               },
//             },
//           },
//         });

//         return this.formatSearchResponse(fallbackResponse.body, 1, limit);
//       }

//       return {
//         products: [],
//         pagination: { page: 1, limit, total: 0, totalPages: 0 },
//         facets: {
//           categories: [],
//           brands: [],
//           priceRanges: [],
//           priceStats: { avg: 0, min: 0, max: 0 },
//         },
//       };
//     }
//   }

//   private formatSearchResponse(response: any, page: number, limit: number) {
//     const hits = response.hits.hits.map((hit: any) => ({
//       ...hit._source,
//       _score: hit._score,
//       _id: hit._id,
//       highlights: hit.highlight,
//     }));

//     const aggregations = response.aggregations || {};
    
//     return {
//       products: hits,
//       pagination: {
//         page,
//         limit,
//         total: response.hits.total?.value || response.hits.total || 0,
//         totalPages: Math.ceil((response.hits.total?.value || response.hits.total || 0) / limit),
//       },
//       facets: {
//         categories: aggregations.categories?.buckets || [],
//         brands: aggregations.brands?.buckets || [],
//         priceRanges: aggregations.price_ranges?.buckets || [],
//         priceStats: {
//           avg: aggregations.avg_price?.value || 0,
//           min: aggregations.min_price?.value || 0,
//           max: aggregations.max_price?.value || 0,
//         },
//       },
//     };
//   }
// }

// export const productSearchService = new ProductSearchService()  const settings: any = {
//       number_of_shards: 2,
//       number_of_replicas: 1,
//       analysis: {
//         analyzer: {
//           product_analyzer: {
//             type: "custom",
//             tokenizer: "standard",
//             filter: ["lowercase", "asciifolding", "synonym_filter"],
//           },
//         },
//         filter: {
//           synonym_filter: {
//             type: "synonym",
//             synonyms: [
//               "laptop,notebook,computer",
//               "phone,mobile,smartphone,cellphone,iphone",
//               "headphone,earphone,headset,earbuds",
//               "tv,television,smart tv",
//               "watch,smartwatch",
//               "tablet,ipad,tab",
//             ],
//           },
//         },
//       },
//     };