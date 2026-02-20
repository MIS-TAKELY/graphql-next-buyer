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
        const { product: clientProduct, messages } = await req.json();

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

        try {
            // Fetch detailed product
            const { data: productData } = await apolloClient.query({
                query: GET_PRODUCT,
                variables: { productId: clientProduct.id },
                fetchPolicy: "no-cache"
            });

            if (productData?.getProduct) {
                fullProduct = productData.getProduct;
            }

            // Fetch related products from the same category (specifically sub-sub-category if available)
            // The product usually falls under a category that might have parents/children.
            // In the DB, the product is linked to a specific category. Let's trace to the deepest one available in the context.
            let categorySlug = fullProduct.category?.slug || clientProduct.category?.slug;

            // To ensure we choose the last child category (sub-sub category), we might need to check the category object deeply
            // or just rely on the assigned category being the most specific one. Typically in ecommerce, 
            // the assigned category IS the most specific one. But just in case, we'll use the assigned category's slug.
            // If the category object provides `children` and they exist, we could try to go deeper, but usually the 
            // associated category on the product *is* the leaf category.

            if (categorySlug) {
                const { data: categoryData } = await apolloClient.query({
                    query: GET_CATEGORY_PRODUCTS,
                    variables: { categorySlug, limit: 10 }, // Fetch a few more to filter out the current product
                    fetchPolicy: "no-cache"
                });

                if (categoryData?.getProductsByCategory?.products) {
                    // Filter out the current product from the related list
                    categoryProducts = categoryData.getProductsByCategory.products.filter(
                        (p: any) => p.slug !== fullProduct.slug && p.slug !== clientProduct.slug
                    );
                }
            }
        } catch (dbError) {
            console.error("Error fetching extra context for AI:", dbError);
            // Fallback to client product if DB fetch fails
        }

        // Build a concise system prompt to keep token count low for faster inference
        const truncatedDescription = fullProduct.description
            ? fullProduct.description
            : "No description available.";

        const specsSnippet = fullProduct.specificationTable
            ? JSON.stringify(fullProduct.specificationTable)
            : "No specifications available.";

        const variantsSnippet = fullProduct.variants
            ? fullProduct.variants
                .map((v: any) => `${v.name || "Variant"}: ${JSON.stringify(v.attributes)}`)
                .join(", ")
            : "No variants.";

        // Include related products context
        const relatedProductsSnippet = categoryProducts.length > 0
            ? categoryProducts.map(p => `${p.name} (Price: ${p.variants?.[0]?.price || 'N/A'})`).join(", ")
            : "No related products found in this category.";

        const systemPrompt = `You are a concise AI Product Assistant for Vanijay (Nepal).
Product: ${fullProduct.name}
Brand: ${typeof fullProduct.brand === "string" ? fullProduct.brand : fullProduct.brand?.name || "N/A"}
Description: ${truncatedDescription}
Specs: ${specsSnippet}
Variants: ${variantsSnippet}
Related Products in same category: ${relatedProductsSnippet}
Rules: Be very concise (9-10 sentences max). Prices in NPR. Only answer based on the given details. If asked about similar products, suggest from the Related Products list.`;

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
