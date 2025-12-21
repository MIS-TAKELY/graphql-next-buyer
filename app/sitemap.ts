import { GET_PRODUCTS } from "@/client/product/product.queries";
import { getPublicServerApolloClient } from "@/lib/apollo/apollo-server-client";
import { IProducts } from "@/types/product";
import { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://dai-ecommerce.com";

    let products: IProducts[] = [];

    try {
        const client = await getPublicServerApolloClient();
        const { data } = await client.query({
            query: GET_PRODUCTS,
            fetchPolicy: "no-cache",
        });
        products = data?.getProducts || [];
    } catch (error) {
        console.error("Error fetching products for sitemap:", error);
    }

    const productUrls = products.map((product) => ({
        url: `${baseUrl}/shop/product/${product.slug}`,
        lastModified: new Date(),
        changeFrequency: "daily" as const,
        priority: 0.8,
    }));

    const staticRoutes = [
        "",
        "/shop",
        "/shop/cateygory", // Note: keeping typo as requested per existing structure
        // Add other static routes here
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: "daily" as const,
        priority: 1.0,
    }));

    return [...staticRoutes, ...productUrls];
}
