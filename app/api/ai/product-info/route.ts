import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const { product, messages } = await req.json();

        if (!product || !messages) {
            return NextResponse.json(
                { error: "Product data and messages are required" },
                { status: 400 }
            );
        }

        // Build a concise system prompt to keep token count low for faster inference
        const truncatedDescription = product.description
            ? product.description.substring(0, 400)
            : "No description available.";

        const specsSnippet = product.specificationTable
            ? JSON.stringify(product.specificationTable).substring(0, 600)
            : "No specifications available.";

        const variantsSnippet = product.variants
            ? product.variants
                .map((v: any) => `${v.name || "Variant"}: ${JSON.stringify(v.attributes)}`)
                .join(", ")
                .substring(0, 300)
            : "No variants.";

        const systemPrompt = `You are a concise AI Product Assistant for Vanijay (Nepal).
Product: ${product.name}
Brand: ${typeof product.brand === "string" ? product.brand : product.brand?.name || "N/A"}
Description: ${truncatedDescription}
Specs: ${specsSnippet}
Variants: ${variantsSnippet}
Rules: Be very concise (2-3 sentences max). Prices in NPR. Only answer based on the given details.`;

        const ollamaPayload = {
            model: "qwen2.5:3b",
            messages: [
                { role: "system", content: systemPrompt },
                ...messages,
            ],
            stream: true, // Enable streaming so tokens are sent to browser immediately
        };

        // Call Ollama - this returns immediately with a streaming body
        const ollamaResponse = await fetch("http://ollama:11434/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(ollamaPayload),
        });

        if (!ollamaResponse.ok || !ollamaResponse.body) {
            return NextResponse.json(
                { error: "AI model is unavailable. Please try again." },
                { status: 503 }
            );
        }

        // Forward Ollama's token stream to the browser as plain text chunks
        const encoder = new TextEncoder();
        const decoder = new TextDecoder();
        const ollamaReader = ollamaResponse.body.getReader();

        const stream = new ReadableStream({
            async start(controller) {
                try {
                    while (true) {
                        const { done, value } = await ollamaReader.read();
                        if (done) break;

                        const chunk = decoder.decode(value, { stream: true });
                        // Ollama sends NDJSON - one JSON object per line
                        for (const line of chunk.split("\n")) {
                            if (!line.trim()) continue;
                            try {
                                const json = JSON.parse(line);
                                const token = json?.message?.content;
                                if (token) {
                                    controller.enqueue(encoder.encode(token));
                                }
                            } catch {
                                // Skip malformed lines
                            }
                        }
                    }
                } finally {
                    controller.close();
                    ollamaReader.releaseLock();
                }
            },
        });

        return new Response(stream, {
            headers: {
                "Content-Type": "text/plain; charset=utf-8",
                "Transfer-Encoding": "chunked",
                "Cache-Control": "no-cache",
                "X-Content-Type-Options": "nosniff",
            },
        });
    } catch (error) {
        console.error("AI API Error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
