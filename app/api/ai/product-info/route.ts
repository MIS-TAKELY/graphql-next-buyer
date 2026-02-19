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

        // Construct a rich system prompt with product context
        const specs = product.specificationTable
            ? JSON.stringify(product.specificationTable)
            : "No detailed specifications available.";

        const variants = product.variants
            ? product.variants.map((v: any) => `${v.name || 'Variant'}: ${JSON.stringify(v.attributes)} - Price: ${v.price}`).join("\n")
            : "No variants available.";

        const systemPrompt = `You are an AI Product Assistant for Vanijay, an e-commerce platform in Nepal.
Your goal is to help users with details about the following product:
Product Name: ${product.name}
Description: ${product.description || 'N/A'}
Brand: ${typeof product.brand === "string" ? product.brand : product.brand?.name || 'N/A'}
Category: ${product.category?.name || 'N/A'}

Specifications:
${specs}

Variants:
${variants}

Instructions:
1. Be helpful, professional, and concise.
2. Only answer questions related to this product based on the information provided.
3. If you don't know the answer, politely suggest the user contact the seller or check the official specs.
4. Mention that prices are in NPR.
5. Provide details about specific variants if asked.
6. Use friendly language suitable for a shopping assistant.`;

        const ollamaPayload = {
            model: "qwen2.5:3b",
            messages: [
                { role: "system", content: systemPrompt },
                ...messages,
            ],
            stream: false,
        };

        // Note: 'ollama' is the container name on the docker network
        const response = await fetch("http://ollama:11434/api/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(ollamaPayload),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Ollama error:", errorText);
            return NextResponse.json(
                { error: "Failed to get response from AI" },
                { status: 500 }
            );
        }

        const data = await response.json();
        return NextResponse.json(data.message);
    } catch (error) {
        console.error("AI API Error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
