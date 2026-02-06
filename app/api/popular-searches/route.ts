import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export const dynamic = 'force-dynamic'; // Ensure it's not statically generated since we want SWR to handle caching or fresh data
// Actually if we want cache, 'force-static' with revalidate? 
// User asked "Cache with SWR/React Query (revalidate every 5 minutes)".
// This implies client side fetching. The API can be dynamic or cached.
// I'll make it dynamic but with Cache-Control headers so CDN/Next.js middleware can cache it if suitable, but SWR will hit it.

export async function GET() {
    try {
        const categories = await prisma.popularSearchCategory.findMany({
            where: {
                isActive: true,
                isIndexed: true,
            },
            orderBy: {
                displayOrder: 'asc',
            },
            include: {
                keywords: {
                    where: {
                        isActive: true,
                        isIndexed: true,
                    },
                    orderBy: {
                        displayOrder: 'asc',
                    },
                },
            },
        });

        const response = NextResponse.json(categories);
        // Cache for 5 minutes (300 seconds)
        response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=59');
        return response;
    } catch (error) {
        console.error('Error fetching popular searches:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
