import { pipeline } from "@xenova/transformers";

const extractor = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");

export async function generateEmbedding(text:any) {
  const output = await extractor(text, { pooling: "mean", normalize: true });
  return Array.from(output.data);
}
