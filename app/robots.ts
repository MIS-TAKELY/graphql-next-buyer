import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://vanijay.com";

    return {
        rules: {
            userAgent: "*",
            allow: "/",
            disallow: [
                "/app/(main)/cart",
                "/app/(main)/checkout",
                "/app/(main)/account",
                "/shop/cart",
                "/shop/checkout",
                "/shop/account",
                "/admin",
                "/api/",
            ],
        },
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}
