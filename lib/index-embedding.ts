// lib/embeddings.ts

let extractor: any | null = null;
let pipelineModule: any | null = null;

async function loadPipeline() {
  if (pipelineModule) return pipelineModule;
  try {
    // dynamic import so Vercel doesn't try to load native libs at build-time
    pipelineModule = await import("@xenova/transformers");
    return pipelineModule;
  } catch (err) {
    console.error(
      "Could not import @xenova/transformers. Likely missing native libs. Falling back.",
      err
    );
    pipelineModule = null;
    return null;
  }
}

async function initExtractor() {
  if (extractor) return extractor;
  const mod = await loadPipeline();
  if (!mod || !mod.pipeline) {
    // Not available in this environment
    return null;
  }
  extractor = await mod.pipeline(
    "feature-extraction",
    "Xenova/all-MiniLM-L6-v2"
  );
  return extractor;
}

export async function generateEmbedding(
  text: string
): Promise<number[] | null> {
  const e = await initExtractor();
  if (!e) {
    // fallback: return null so caller can either skip or use different embedding
    return null;
  }
  const output = await e(text, { pooling: "mean", normalize: true });
  return Array.from(output.data);
}
