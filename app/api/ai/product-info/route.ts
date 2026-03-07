import { NextRequest, NextResponse } from "next/server";
import { getServerApolloClient } from "@/lib/apollo/apollo-server-client";
import { GET_PRODUCT } from "@/client/product/product.queries";
import { gql } from "@apollo/client";

// Define a query to get products by category since GET_PRODUCTS_BY_CATEGORY in product.queries might not exist or be different
const GET_CATEGORY_PRODUCTS = gql`
  query GetProductsByCategory($categorySlug: String!, $limit: Int) {
    getProductsByCategory(categorySlug: $categorySlug, limit: $limit) {
      products {
        id
        name
        slug
        variants {
          price
        }
      }
    }
  }
`;

export async function POST(req: NextRequest) {
    try {
        const { product: clientProduct, messages, isInitial, user } = await req.json();

        if (!clientProduct || !messages) {
            return NextResponse.json(
                { error: "Product data and messages are required" },
                { status: 400 }
            );
        }

        // Fetch full product details from the database using Apollo Server Client
        const apolloClient = await getServerApolloClient();
        let fullProduct = clientProduct;
        let categoryProducts: any[] = [];
        let categorySlug = clientProduct.category?.slug;
        let categoryName = clientProduct.category?.name || "its category";

        try {
            // Fetch detailed product and category products in parallel to optimize response time
            categorySlug = clientProduct.category?.slug;

            const queries: Promise<any>[] = [
                apolloClient.query({
                    query: GET_PRODUCT,
                    variables: { productId: clientProduct.id },
                    fetchPolicy: "no-cache"
                })
            ];

            if (categorySlug) {
                queries.push(
                    apolloClient.query({
                        query: GET_CATEGORY_PRODUCTS,
                        variables: { categorySlug, limit: 10 },
                        fetchPolicy: "no-cache"
                    })
                );
            }

            // Set a hard 2.5-second timeout on DB fetching so the AI still responds if DB is slow
            const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("DB_TIMEOUT")), 2500));
            const results = await Promise.race([
                Promise.allSettled(queries),
                timeoutPromise
            ]) as PromiseSettledResult<any>[];

            // Handle Product Query Result
            if (results[0]?.status === "fulfilled" && results[0].value.data?.getProduct) {
                fullProduct = results[0].value.data.getProduct;
                categorySlug = fullProduct.category?.slug || categorySlug;
                categoryName = fullProduct.category?.name || categoryName;
            }

            // Handle Category Query Result
            if (results[1] && results[1].status === "fulfilled" && results[1].value.data?.getProductsByCategory?.products) {
                categoryProducts = results[1].value.data.getProductsByCategory.products.filter(
                    (p: any) => p.slug !== fullProduct.slug && p.slug !== clientProduct.slug
                );
            } else if (!results[1] && categorySlug && fullProduct.category?.slug !== clientProduct.category?.slug) {
                // Background fetch deep category if missed (won't block this request if it's slow, so we use race)
                const fallbackFetch = apolloClient.query({
                    query: GET_CATEGORY_PRODUCTS,
                    variables: { categorySlug, limit: 8 },
                    fetchPolicy: "no-cache"
                });

                try {
                    const categoryDataObj = await Promise.race([fallbackFetch, timeoutPromise]) as any;
                    if (categoryDataObj?.data?.getProductsByCategory?.products) {
                        categoryProducts = categoryDataObj.data.getProductsByCategory.products.filter(
                            (p: any) => p.slug !== fullProduct.slug && p.slug !== clientProduct.slug
                        );
                    }
                } catch (e) { /* ignore fallback errors */ }
            }
        } catch (dbError) {
            console.error("Error fetching extra context for AI - proceeding with clientProduct:", dbError);
            // Fallback to client product if DB fetch fails or times out
        }

        // Build a comprehensive but COMPACT system prompt to avoid high token evaluation times (which cause 504 Timeouts)
        const descriptionSnippet = fullProduct.description
            ? fullProduct.description.substring(0, 400) + (fullProduct.description.length > 400 ? "..." : "")
            : "No description available.";

        // Format specs cleanly instead of huge JSON strings
        let mappedSpecs = "No specifications available.";
        if (fullProduct.specificationTable && Array.isArray(fullProduct.specificationTable)) {
            mappedSpecs = fullProduct.specificationTable.map((t: any) => {
                const rows = t.rows || [];
                return rows.map((r: any) => `${r[0]}: ${r[1]}`).join(", ");
            }).join(" | ").substring(0, 500);
        } else if (typeof fullProduct.specificationTable === "object" && fullProduct.specificationTable !== null) {
            mappedSpecs = JSON.stringify(fullProduct.specificationTable).substring(0, 500);
        }

        // Compact variants (max 3)
        const variantsSnippet = fullProduct.variants && fullProduct.variants.length > 0
            ? fullProduct.variants.slice(0, 3).map((v: any) => `${v.name || "Var"}: NPR ${v.price}`).join(" | ")
            : "No variants listed.";

        const featuresSnippet = fullProduct.features && fullProduct.features.length > 0
            ? fullProduct.features.slice(0, 5).join(", ")
            : "No specific features listed.";

        // Include related products context (limit to 5 to save context)
        const relatedProductsSnippet = categoryProducts.length > 0
            ? categoryProducts.slice(0, 5).map((p: any) => `- ${p.name} (NPR ${p.variants?.[0]?.price || 'N/A'})`).join("\n")
            : `No related products found in ${categoryName}.`;

        const userName = user?.name || (user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : null);
        const greetingContext = userName
            ? `IF isInitial: Proactively greet the user calling them by their name (${userName}) and provide a VERY brief (1-2 sentences) summary of why they should buy this product based on its key features or specs. End with "How can I help you today?".`
            : `IF isInitial: Proactively greet the user and provide a VERY brief (1-2 sentences) summary of why they should buy this product based on its key features or specs. End with "How can I help you today?".`;

        const systemPrompt = `You are an expert AI Product Assistant for Vanijay (Nepal).
        You are currently helping a user who is looking at the following product:

        --- PRODUCT DETAILS ---
        Name: ${fullProduct.name}
        Brand: ${typeof fullProduct.brand === "string" ? fullProduct.brand : fullProduct.brand?.name || "N/A"}
        Category: ${categoryName}
        Features: ${featuresSnippet}
        Description: ${descriptionSnippet}
        Variants: ${variantsSnippet}
        Specs: ${mappedSpecs}

        --- RELATED PRODUCTS (${categoryName}) ---
        ${relatedProductsSnippet}

        --- INSTRUCTIONS ---
        1. ROLE: You are a strict Vanijay Product Assistant.
        2. STRICT GUARDRAIL 1 - NO OFF-TOPIC: If a user asks a question that is NOT about this product or the related products (e.g., math, general knowledge, coding, writing), you MUST reply EXACTLY with: "I am a product assistant and can only answer questions related to this product."
        3. STRICT GUARDRAIL 2 - NO COMPETITORS: DO NOT acknowledge, suggest, or mention other e-commerce sites (e.g., Daraz, Flipkart, Sastodeal, Amazon, Hukut). If they ask about buying it elsewhere, reply EXACTLY with: "You can purchase this directly here on Vanijay."
        4. ${greetingContext}
        5. formatting: Prices are ALWAYS in Nepalese Rupees (NPR).
        6. Prioritize answering with a simple "Yes." or "No." if the user's question is a simple yes/no question.
        7. IF asked to EXPLAIN, COMPARE, or SUGGEST: provide a detailed, well-structured response using markdown bullets/bold.
        8. IF asked to COMPARE: compare the product against the Related Products provided.
        9. For simple questions, be concise (2-4 sentences). For complex requests, provide comprehensive details based ONLY upon the provided specs/variants. Do not invent details.
        10. NEVER use HTML tags. Use ONLY plain text and markdown.`;

        const ollamaPayload = {
            model: "qwen2.5:1.5b",
            messages: [
                { role: "system", content: systemPrompt },
                ...messages.slice(-6).map((m: any) => ({
                    role: m.role,
                    content: m.content === "INITIAL_GREETING" ? "Greet me and summarize the product." : m.content
                })),
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
                let buffer = "";
                try {
                    while (true) {
                        const { done, value } = await ollamaReader.read();
                        if (done) {
                            // Process any remaining buffer
                            if (buffer.trim()) {
                                try {
                                    const json = JSON.parse(buffer);
                                    const token = json?.message?.content;
                                    if (token) controller.enqueue(encoder.encode(token));
                                } catch { /* ignore final partial */ }
                            }
                            break;
                        }

                        buffer += decoder.decode(value, { stream: true });
                        const lines = buffer.split("\n");
                        // Keep the last partial line in the buffer
                        buffer = lines.pop() || "";

                        for (const line of lines) {
                            if (!line.trim()) continue;
                            try {
                                const json = JSON.parse(line);
                                const token = json?.message?.content;
                                if (token) {
                                    controller.enqueue(encoder.encode(token));
                                }
                            } catch {
                                // Skip genuinely malformed lines but preserve progress
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
