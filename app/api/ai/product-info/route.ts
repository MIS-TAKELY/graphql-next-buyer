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

        // Optimize context: Truncate description and clean up specs/variants to speed up inference
        const truncatedDescription = product.description
            ? product.description.substring(0, 500) + "..."
            : "No description available.";

        const specsSnippet = product.specificationTable
            ? JSON.stringify(product.specificationTable).substring(0, 800) + "..."
            : "No detailed specifications available.";

        const variantsSnippet = product.variants
            ? product.variants.map((v: any) => `${v.name || 'Variant'}: ${JSON.stringify(v.attributes)}`).join(", ").substring(0, 400) + "..."
            : "No variants available.";

        const systemPrompt = `You are an AI Product Assistant for Vanijay (Nepal).
Help users with details about: ${product.name}.
Brand: ${typeof product.brand === "string" ? product.brand : product.brand?.name || 'N/A'}
Description: ${truncatedDescription}
Specs/Variants: ${specsSnippet} | ${variantsSnippet}

Instructions:
1. Be concise (max 2-3 sentences).
2. Only answer based on these details.
3. Prices in NPR.`;

        const ollamaPayload = {
            model: "qwen2.5:3b",
            messages: [
                { role: "system", content: systemPrompt },
                ...messages,
            ],
            stream: false,
        };

        // Use AbortController for a 25-second timeout (to return JSON before Cloudflare 504)
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 25000);

        try {
            // Note: 'ollama' is the container name on the docker network
            const response = await fetch("http://ollama:11434/api/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(ollamaPayload),
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                const errorText = await response.text();
                console.error("Ollama error:", errorText);
                return NextResponse.json(
                    { error: "AI model is currently busy or unavailable. Please try again in a moment." },
                    { status: 503 }
                );
            }

            const data = await response.json();
            return NextResponse.json(data.message);
        } catch (err: any) {
            if (err.name === 'AbortError') {
                return NextResponse.json(
                    { error: "The AI took too long to respond. Please try a simpler question or try again later." },
                    { status: 504 }
                );
            }
            throw err;
        }
    } catch (error) {
        console.error("AI API Error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
