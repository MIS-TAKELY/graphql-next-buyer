import {
  EMBEDDING_DIMENSION,
  opensearchClient,
  PRODUCT_INDEX,
} from "../config/opensearch.config";

export class OpenSearchIndexService {
  private supportsKNN = false;

  async checkKNNSupport(): Promise<boolean> {
    try {
      console.log("hello")
      const response = await opensearchClient.cat.plugins({
        format: "json",
      });
      console.log("hello again")


      this.supportsKNN = response.body.some(
        (plugin: any) =>
          plugin.component?.toLowerCase().includes("knn") ||
          plugin.name?.toLowerCase().includes("knn")
      );

      console.log("KNN Support:", this.supportsKNN);
      return this.supportsKNN;
    } catch (error) {
      console.log("Could not check KNN support, assuming not available");
      return false;
    }
  }

  async createProductIndex() {
    const indexExists = await opensearchClient.indices.exists({
      index: PRODUCT_INDEX,
    });

    if (indexExists.body) {
      console.log(`Index ${PRODUCT_INDEX} already exists`);
      return;
    }

    // Check for KNN support
    const hasKNN = await this.checkKNNSupport();

    if (hasKNN) {
      console.log("supports Knn");
    } else {
      console.log("doestsupport Knn");
    }

    const mappings: any = {
      properties: {
        id: { type: "keyword" },
        name: {
          type: "text",
          analyzer: "standard",
          fields: {
            keyword: { type: "keyword" },
            suggest: {
              type: "completion",
            },
          },
        },
        description: {
          type: "text",
          analyzer: "standard",
        },
        brand: {
          type: "text",
          fields: {
            keyword: { type: "keyword" },
          },
        },
        category: {
          type: "object",
          properties: {
            id: { type: "keyword" },
            name: { type: "text" },
            slug: { type: "keyword" },
          },
        },
        price: {
          type: "scaled_float",
          scaling_factor: 100,
        },
        mrp: {
          type: "scaled_float",
          scaling_factor: 100,
        },
        discount: { type: "float" },
        status: { type: "keyword" },
        sellerId: { type: "keyword" },
        sellerName: { type: "text" },
        rating: { type: "float" },
        reviewCount: { type: "integer" },
        stock: { type: "integer" },
        images: {
          type: "nested",
          properties: {
            url: { type: "keyword" },
            altText: { type: "text" },
          },
        },
        specifications: {
          type: "nested",
          properties: {
            key: { type: "keyword" },
            value: { type: "text" },
          },
        },
        createdAt: { type: "date" },
        updatedAt: { type: "date" },
      },
    };

    // Only add embedding field if KNN is supported
    if (hasKNN) {
      mappings.properties.embedding = {
        type: "knn_vector",
        dimension: EMBEDDING_DIMENSION,
        method: {
          name: "hnsw",
          space_type: "cosinesimil",
          engine: "faiss",
          parameters: {
            ef_construction: 128,
            m: 24,
          },
        },
      };
    }

    // Build settings
    // opensearch-index.services.ts
    const settings: any = {
      number_of_shards: 2,
      number_of_replicas: 1,
      analysis: {
        analyzer: {
          product_analyzer: {
            type: "custom",
            tokenizer: "standard",
            filter: [
              "lowercase",
              "asciifolding",
              "stemmer", // Add stemming for better matching
              "edge_ngram_filter", // Add for autocomplete/partial matching
            ],
          },
        },
        filter: {
          stemmer: {
            type: "stemmer",
            language: "english",
          },
          edge_ngram_filter: {
            type: "edge_ngram",
            min_gram: 2,
            max_gram: 20,
          },
        },
      },
    };

    // Only add KNN settings if supported
    if (hasKNN) {
      settings["index.knn"] = true;
    }

    try {
      await opensearchClient.indices.create({
        index: PRODUCT_INDEX,
        body: {
          settings,
          mappings,
        },
      });

      console.log(
        `Index ${PRODUCT_INDEX} created successfully (KNN: ${hasKNN})`
      );
    } catch (error: any) {
      console.error(
        "Failed to create index:",
        error.meta?.body?.error || error
      );
      throw error;
    }
  }

  async deleteIndex() {
    try {
      console.log("deleting....")
      const indexExists = await opensearchClient.indices.exists({
        index: PRODUCT_INDEX,
      });


      if (indexExists.body) {
        await opensearchClient.indices.delete({
          index: PRODUCT_INDEX,
        });
        console.log(`Index ${PRODUCT_INDEX} deleted`);
      }
    } catch (error) {
      console.error("Failed to delete index:", error);
      throw error;
    }
  }

  getKNNSupport(): boolean {
    return this.supportsKNN;
  }
}

export const openSearchIndexService = new OpenSearchIndexService();
