import { pipeline, Pipeline } from '@xenova/transformers';

class EmbeddingService {
  private extractor: Pipeline | null = null;

  async initialize() {
    if (!this.extractor) {
      // Using all-MiniLM-L6-v2 for 384-dimensional embeddings
      this.extractor = await pipeline(
        'feature-extraction',
        'Xenova/all-MiniLM-L6-v2'
      );
    }
  }

  async generateEmbedding(text: string): Promise<number[]> {
    await this.initialize();
    
    if (!this.extractor) {
      throw new Error('Embedding extractor not initialized');
    }

    const output = await this.extractor(text, {
      pooling: 'mean',
      normalize: true,
    });

    return Array.from(output.data as Float32Array);
  }

  async generateBatchEmbeddings(texts: string[]): Promise<number[][]> {
    const embeddings = await Promise.all(
      texts.map(text => this.generateEmbedding(text))
    );
    return embeddings;
  }
}

export const embeddingService = new EmbeddingService();