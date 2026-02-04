export async function callLLM(prompt: string, model: string = "qwen2.5:3b"): Promise<string> {
    const OLLAMA_URL = process.env.OLLAMA_URL || "http://72.61.249.56:11434/api/generate";

    try {
        const response = await fetch(OLLAMA_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model,
                prompt,
                stream: false,
                format: "json",
            }),
        });

        if (!response.ok) {
            throw new Error(`Ollama API failed: ${response.statusText}`);
        }

        const data = await response.json();
        return data.response;
    } catch (error) {
        console.error("Error calling LLM:", error);
        throw error;
    }
}
