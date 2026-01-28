import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
    const baseUrl = process.env.NODE_ENV === "production" ? "https://www.vanijay.com" : (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000");
    return {
        rules: {
            userAgent: "*",
            allow: "/",
            disallow: [
                "/api/",
                "/admin/",
                "/shop/cart",
                "/shop/checkout",
                "/shop/account",
                "/cart",
                "/checkout",
                "/account",
            ],
        },
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}
