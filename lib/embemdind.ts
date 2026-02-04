import axios from "axios";

export async function generateEmbedding(text: string): Promise<number[]> {
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

    const response = await axios.post(process.env.EMBEDDING_API_URL, {
      texts: [text],
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

    return data.embeddings[0]; // Returns 384-dimensional vector
  } catch (error: any) {
    console.error("Failed to generate embedding:", error.message || error);
    // Return zero vector on failure to prevent crashes/loops in callers
    return new Array(384).fill(0);
  }
}
