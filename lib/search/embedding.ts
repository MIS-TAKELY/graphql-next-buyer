export async function getEmbedding(text: string): Promise<number[]> {
    const EMBEDDING_API_URL = process.env.EMBEDDING_API_URL || "http://72.61.249.56:8000/embed";

    // E5 models often benefit from 'query: ' prefix for search queries
    const processedText = `query: ${text}`;

    try {
        const response = await fetch(EMBEDDING_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                texts: [processedText],
            }),
        });

        if (!response.ok) {
            throw new Error(`Embedding API failed: ${response.statusText}`);
        }

        const data = await response.json();
        return data.embeddings[0];
    } catch (error) {
        console.error("Error fetching embedding:", error);
        throw error;
    }
}
