import { prisma } from "../lib/db/prisma";
import { APP_URL } from "@/config/env";
import { MetadataRoute } from "next";

export const revalidate = 3600; // Revalidate sitemap every hour

// Helper to sanitize URLs for XML - escape special characters
function sanitizeUrl(url: string): string {
    return url
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

// Helper to validate and clean slug for URL
function cleanSlug(slug: string | null | undefined): string | null {
    if (!slug) return null;
    // Remove any characters that shouldn't be in URLs
    const cleaned = slug
        .trim()
        .replace(/\s+/g, '-')  // Replace spaces with hyphens
        .replace(/[&<>"']/g, '') // Remove XML special characters
        .replace(/[^\w\-]/g, ''); // Keep only word characters and hyphens
    return cleaned || null;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = APP_URL;

    let categories: { slug: string; updatedAt: Date }[] = [];
    let products: { slug: string; updatedAt: Date }[] = [];
    let sellerProfiles: { slug: string; updatedAt: Date }[] = [];

    try {
        const [cats, prods, sellers] = await Promise.all([
            prisma.category.findMany({
                where: { isActive: true },
                select: { slug: true, updatedAt: true }
            }),
            prisma.product.findMany({
                where: { status: "ACTIVE" },
                select: { slug: true, updatedAt: true }
            }),
            prisma.sellerProfile.findMany({
                where: { 
                    isActive: true,
                    verificationStatus: "APPROVED"
                },
                select: { slug: true, updatedAt: true }
            })
        ]);
        categories = cats || [];
        products = prods || [];
        sellerProfiles = sellers || [];
    } catch (error) {
        console.error("Error fetching data for sitemap:", error);
        // Return only static routes if database fails
    }

    // Static routes - high priority pages
    const staticRoutes = [
        { route: "", priority: 1.0, changeFrequency: "daily" as const },
        { route: "/about", priority: 0.8, changeFrequency: "monthly" as const },
        { route: "/contact", priority: 0.8, changeFrequency: "monthly" as const },
        { route: "/blog", priority: 0.7, changeFrequency: "weekly" as const },
        { route: "/careers", priority: 0.5, changeFrequency: "monthly" as const },
        { route: "/privacy-policy", priority: 0.3, changeFrequency: "yearly" as const },
        { route: "/cookie-policy", priority: 0.3, changeFrequency: "yearly" as const },
        { route: "/terms-conditions", priority: 0.3, changeFrequency: "yearly" as const },
        { route: "/returns-policy", priority: 0.3, changeFrequency: "yearly" as const },
        { route: "/shipping-policy", priority: 0.3, changeFrequency: "yearly" as const },
        { route: "/site-map", priority: 0.3, changeFrequency: "monthly" as const },
        { route: "/help", priority: 0.6, changeFrequency: "monthly" as const },
    ].map(({ route, priority, changeFrequency }) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency,
        priority,
    }));

    // Category URLs - dynamically generated from database
    const categoryUrls = categories
        .filter(category => cleanSlug(category.slug)) // Filter out invalid slugs
        .map((category) => ({
            url: `${baseUrl}/category/${encodeURIComponent(category.slug)}`,
            lastModified: category.updatedAt || new Date(),
            changeFrequency: "weekly" as const,
            priority: 0.7,
        }));

    // Product URLs - dynamically generated from database
    const productUrls = products
        .filter(product => cleanSlug(product.slug)) // Filter out invalid slugs
        .map((product) => ({
            url: `${baseUrl}/product/${encodeURIComponent(product.slug)}`,
            lastModified: product.updatedAt || new Date(),
            changeFrequency: "daily" as const,
            priority: 0.8,
        }));

    // Seller store URLs - dynamically generated from verified seller profiles
    const storeUrls = sellerProfiles
        .filter(seller => cleanSlug(seller.slug)) // Filter out invalid slugs
        .map((seller) => ({
            url: `${baseUrl}/store/${encodeURIComponent(seller.slug)}`,
            lastModified: seller.updatedAt || new Date(),
            changeFrequency: "weekly" as const,
            priority: 0.6,
        }));

    return [...staticRoutes, ...categoryUrls, ...productUrls, ...storeUrls];
}
