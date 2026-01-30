import { APP_URL } from "@/config/env";
import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
    const baseUrl = APP_URL;

    return {
        rules: [
            {
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
                    "/search*",     // Exclude search results
                    "/*?*",         // Exclude all query param URLs
                ],
            },
            {
                userAgent: ["Amazonbot", "Applebot-Extended", "Bytespider", "CCBot", "ClaudeBot", "Google-Extended", "GPTBot", "meta-externalagent"],
                disallow: ["/"],
            },
        ],
        sitemap: `${baseUrl}/sitemap-index.xml`,
        host: baseUrl,
    };
}
