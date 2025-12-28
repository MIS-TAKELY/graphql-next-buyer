import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.vanijay.com";

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
