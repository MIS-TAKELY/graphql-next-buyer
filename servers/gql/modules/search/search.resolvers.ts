import { Prisma } from "@/app/generated/prisma";
import { prisma } from "@/lib/db/prisma";
import { generateEmbedding } from "@/lib/embemdind";
import { openSearchIndexService } from "@/services/opensearch-index.services";
import { productIndexingService } from "@/services/product-indexing.services";
import { productSearchService } from "@/services/product-search.services";
import { GraphQLError } from "graphql";

export const searchResolvers = {
  Query: {
    // searchProducts: async (
    //   _: any,
    //   args: {
    //     query: string;
    //     filters?: any;
    //     sortBy?: string;
    //     page?: number;
    //     limit?: number;
    //     enableSemantic?: boolean;
    //     enableFuzzy?: boolean;
    //   }
    // ) => {
    //   try {
    //     console.log('Search query:', args.query);
    //     console.log('Search args:', args);

    //     const results = await productSearchService.search({
    //       query: args.query,
    //       filters: args.filters || {},
    //       sortBy: args.sortBy as any || 'relevance',
    //       page: args.page || 1,
    //       limit: args.limit || 20,
    //       enableSemantic: args.enableSemantic !== false,
    //       enableFuzzy: args.enableFuzzy !== false,
    //     });

    //     console.log(`Found ${results.products.length} products`);
    //     return results;
    //   } catch (error: any) {
    //     console.error('Search error details:', error);
    //     throw new GraphQLError('Failed to search products', {
    //       extensions: {
    //         code: 'SEARCH_ERROR',
    //         error: error.message,
    //         details: error.meta?.body?.error || error.body?.error,
    //       },
    //     });
    //   }
    // },

    searchProducts: async (_: any, { query }) => {
      const vector = await generateEmbedding(query);
      const vectorString = `[${vector.join(",")}]`;

      const results = await prisma.$queryRaw<
        Array<{
          id: number;
          name: string;
          description: string;
          brand: string;
          similarity: number;
        }>
      >(
        Prisma.sql`
      SELECT 
        id, 
        name, 
        description, 
        brand, 
        1 - (embedding <=> ${Prisma.raw(
          `'${vectorString}'::vector`
        )}) AS similarity
      FROM "products"
      WHERE embedding IS NOT NULL
      ORDER BY similarity DESC
      LIMIT 10
    `
      );

      return {
        products: results.map(({ similarity, ...product }) => product),
      };
    },

    

    searchSuggestions: async (
      _: any,
      args: { query: string; limit?: number }
    ) => {
      try {
        return await productSearchService.suggest(args.query, args.limit || 10);
      } catch (error: any) {
        console.error("Suggestion error:", error);
        throw new GraphQLError("Failed to get search suggestions", {
          extensions: {
            code: "SUGGESTION_ERROR",
            error: error.message,
          },
        });
      }
    },

    similarProducts: async (
      _: any,
      args: { productId: string; limit?: number }
    ) => {
      try {
        return await productSearchService.moreLikeThis(
          args.productId,
          args.limit || 10
        );
      } catch (error: any) {
        console.error("Similar products error:", error);
        throw new GraphQLError("Failed to get similar products", {
          extensions: {
            code: "SIMILAR_PRODUCTS_ERROR",
            error: error.message,
          },
        });
      }
    },
  },

  Mutation: {
    indexProduct: async (_: any, args: { productId: string }) => {
      try {
        await productIndexingService.indexProduct(args.productId);
        return true;
      } catch (error: any) {
        console.error("Index product error:", error);
        throw new GraphQLError("Failed to index product", {
          extensions: {
            code: "INDEX_ERROR",
            error: error.message,
          },
        });
      }
    },

    indexAllProducts: async (
      _: any,
      args: { limit?: number; offset?: number }
    ) => {
      try {
        return await productIndexingService.bulkIndexProducts(
          args.limit || 100,
          args.offset || 0
        );
      } catch (error: any) {
        console.error("Bulk index error:", error);
        throw new GraphQLError("Failed to bulk index products", {
          extensions: {
            code: "BULK_INDEX_ERROR",
            error: error.message,
          },
        });
      }
    },

    removeProductFromIndex: async (_: any, args: { productId: string }) => {
      try {
        await productIndexingService.removeFromIndex(args.productId);
        return true;
      } catch (error: any) {
        console.error("Remove from index error:", error);
        throw new GraphQLError("Failed to remove product from index", {
          extensions: {
            code: "REMOVE_INDEX_ERROR",
            error: error.message,
          },
        });
      }
    },

    recreateSearchIndex: async () => {
      try {
        await openSearchIndexService.deleteIndex();
        await openSearchIndexService.createProductIndex();
        return true;
      } catch (error: any) {
        console.error("Recreate index error:", error);
        throw new GraphQLError("Failed to recreate search index", {
          extensions: {
            code: "RECREATE_INDEX_ERROR",
            error: error.message,
          },
        });
      }
    },
  },

  SearchProduct: {
    score: (parent: any) => parent._score || 0,
  },
};
