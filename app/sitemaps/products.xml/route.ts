import { prisma } from '@/lib/db/prisma';
import { NextResponse } from 'next/server';

export const revalidate = 3600; // 1 hour

export async function GET() {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://vanijay.com';

    const products = await prisma.product.findMany({
        where: {
            status: 'ACTIVE',
            isIndexable: true,
        },
        select: {
            slug: true,
            updatedAt: true,
            lastIndexableUpdate: true,
            canonicalUrl: true,
        },
        orderBy: {
            updatedAt: 'desc',
        },
        take: 50000, // Search console limit per sitemap
    });

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${products.map((product) => `
  <url>
    <loc>${product.canonicalUrl || `${baseUrl}/product/${product.slug}`}</loc>
    <lastmod>${(product.lastIndexableUpdate || product.updatedAt).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`).join('')}
</urlset>`;

    return new NextResponse(xml, {
        headers: {
            'Content-Type': 'application/xml',
        },
    });
}
