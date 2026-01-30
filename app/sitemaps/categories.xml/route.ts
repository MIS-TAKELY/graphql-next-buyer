import { prisma } from '@/lib/db/prisma';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://vanijay.com';

    const categories = await prisma.category.findMany({
        where: {
            isActive: true,
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
        take: 50000,
    });

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${categories.map((category) => `
  <url>
    <loc>${category.canonicalUrl || `${baseUrl}/search/${category.slug}`}</loc>
    <lastmod>${(category.lastIndexableUpdate || category.updatedAt).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('')}
</urlset>`;

    return new NextResponse(xml, {
        headers: {
            'Content-Type': 'application/xml',
            'Cache-Control': 'public, max-age=3600, s-maxage=3600',
        },
    });
}
