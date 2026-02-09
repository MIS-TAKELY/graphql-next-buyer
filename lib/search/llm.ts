export async function callLLM(
    prompt: string,
    model: string = "qwen2.5:3b",
    timeoutMs: number = 10000,
    retries: number = 1
): Promise<string> {
    const baseUrl = process.env.OLLAMA_URL || "http://ollama:11434";
    const OLLAMA_URL = baseUrl.endsWith("/api/generate")
        ? baseUrl
        : `${baseUrl.replace(/\/$/, "")}/api/generate`;

    for (let attempt = 0; attempt <= retries; attempt++) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

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
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`Ollama API failed: ${response.statusText}`);
            }

            const data = await response.json();
            return data.response;
        } catch (error: any) {
            clearTimeout(timeoutId);

            if (error.name === 'AbortError') {
                const timeoutError = new Error('LLM_TIMEOUT');
                if (attempt < retries) {
                    console.warn(`⏱️ LLM timeout (attempt ${attempt + 1}/${retries + 1}), retrying...`);
                    await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1))); // Exponential backoff
                    continue;
                }
                throw timeoutError;
            }

            if (attempt < retries) {
                console.warn(`❌ LLM call failed (attempt ${attempt + 1}/${retries + 1}), retrying...`, error);
                await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
                continue;
            }

            console.error("Error calling LLM:", error);
            throw error;
        }
    }

    throw new Error("LLM call failed after all retries");
}

