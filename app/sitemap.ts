import { prisma } from "../lib/db/prisma";
import { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NODE_ENV === "production" ? "https://www.vanijay.com" : (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000");

    let categories: { slug: string; updatedAt: Date }[] = [];
    let products: { slug: string; updatedAt: Date }[] = [];

    try {
        const [cats, prods] = await Promise.all([
            prisma.category.findMany({
                where: { isActive: true },
                select: { slug: true, updatedAt: true }
            }),
            prisma.product.findMany({
                where: { status: "ACTIVE" },
                select: { slug: true, updatedAt: true }
            })
        ]).catch(err => {
            console.error("Error in sitemap fetching:", err);
            return [[], []];
        });
        categories = cats || [];
        products = prods || [];
    } catch (error) {
        console.error("Error fetching data for sitemap:", error);
    }

    const productUrls = products.map((product) => ({
        url: `${baseUrl}/product/${product.slug}`,
        lastModified: product.updatedAt,
        changeFrequency: "daily" as const,
        priority: 0.8,
    }));

    const categoryUrls = categories.map((category) => ({
        url: `${baseUrl}/category/${category.slug}`,
        lastModified: category.updatedAt || new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.7,
    }));

    const staticRoutes = [
        "",
        "/about",
        "/contact",
        "/blog",
        "/careers",
        "/privacy-policy",
        "/cookie-policy",
        "/terms-conditions",
        "/returns-policy",
        "/shipping-policy",
        "/site-map",
        "/help",
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: "daily" as const,
        priority: 1.0,
    }));

    const blogPosts = [
        "top-10-products-2025",
        "how-to-choose-best",
        "sustainable-shopping",
    ].map((slug) => ({
        url: `${baseUrl}/blog/${slug}`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.6,
    }));

    return [...staticRoutes, ...categoryUrls, ...productUrls, ...blogPosts];
}
