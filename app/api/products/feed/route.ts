import { prisma } from "@/lib/db/prisma";
import { APP_URL } from "@/config/env";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const products = await prisma.product.findMany({
            where: { status: "ACTIVE" },
            select: { slug: true, id: true },
        });

        const baseUrl = APP_URL;
        const urls = products.map((p) => `${baseUrl}/product/${p.slug}-p${p.id}`).join("\n");

        return new Response(urls, {
            headers: {
                "Content-Type": "text/plain",
                "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
            },
        });
    } catch (error) {
        console.error("Error generating product feed:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
