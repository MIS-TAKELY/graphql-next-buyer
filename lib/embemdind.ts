import { OpenAI } from "openai";

export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    // Validate input
    if (!text || typeof text !== 'string') {
      throw new Error(`Invalid text input: ${typeof text}`);
    }

    // Validate API URL is configured
    if (!process.env.EMBEDDING_API_URL) {
      throw new Error("EMBEDDING_API_URL environment variable is not set");
    }

    const response = await fetch(process.env.EMBEDDING_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        texts: [text],
      }),
    });

    if (!response.ok) {
      throw new Error(`Embedding API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.embeddings || !Array.isArray(data.embeddings) || !data.embeddings[0]) {
      throw new Error("Invalid response from embedding API");
    }

    return data.embeddings[0]; // Returns 384-dimensional vector
  } catch (error) {
    console.error("Failed to generate embedding:", error);
    throw error;
  }
}
