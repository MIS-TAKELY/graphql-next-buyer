import axios from "axios";

/**
 * Normalize embedding vector to unit length (L2 normalization)
 * Required for inner product search with E5 models
 * 
 * @param vector - Raw embedding vector
 * @returns Normalized vector with unit length
 */
export function normalizeEmbedding(vector: number[]): number[] {
  const norm = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));

  // Avoid division by zero
  if (norm === 0) {
    console.warn("⚠️ Zero-norm vector detected, returning as-is");
    return vector;
  }

  return vector.map(val => val / norm);
}

/**
 * Generate embedding with E5 model prefix and normalization
 * 
 * E5 models require specific prefixes:
 * - "query: " for search queries
 * - "passage: " for documents/products
 * 
 * @param text - Text to embed
 * @param type - Type of text: 'query' for search queries, 'passage' for documents
 * @returns Normalized 384-dimensional embedding vector
 */
export async function generateEmbedding(
  text: string,
  type: 'query' | 'passage' = 'passage'
): Promise<number[]> {
  try {
    // Validate input
    if (!text || typeof text !== 'string') {
      throw new Error(`Invalid text input: ${typeof text}`);
    }

    // Validate API URL is configured
    if (!process.env.EMBEDDING_API_URL) {
      console.warn("⚠️ EMBEDDING_API_URL not set. Returning zero vector.");
      return new Array(384).fill(0);
    }

    // Add E5 prefix based on type
    // This is CRITICAL for E5 models to work properly
    const prefixedText = type === 'query'
      ? `query: ${text}`
      : `passage: ${text}`;

    const response = await axios.post(process.env.EMBEDDING_API_URL, {
      texts: [prefixedText],
    }, {
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 5000 // 5s timeout to prevent hanging
    });

    const data = response.data;

    if (!data.embeddings || !Array.isArray(data.embeddings) || !data.embeddings[0]) {
      throw new Error("Invalid response from embedding API");
    }

    const rawEmbedding = data.embeddings[0];

    // Normalize to unit length for inner product search
    const normalized = normalizeEmbedding(rawEmbedding);

    return normalized; // Returns normalized 384-dimensional vector
  } catch (error: any) {
    console.error("Failed to generate embedding:", error.message || error);
    // Return zero vector on failure to prevent crashes/loops in callers
    return new Array(384).fill(0);
  }
}
