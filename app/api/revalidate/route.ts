import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function POST(req: NextRequest) {
    try {
        const { slug, secret } = await req.json();

        // Check for secret to prevent unauthorized revalidation
        // For now, we'll check against an environment variable or a default value
        const REVALIDATE_SECRET = process.env.REVALIDATE_SECRET || "default_secret_123";

        if (secret !== REVALIDATE_SECRET) {
            return NextResponse.json({ message: "Invalid secret" }, { status: 401 });
        }

        if (slug) {
            // Revalidate the specific product page
            revalidatePath(`/product/${slug}`);
            console.log(`[Revalidate] Success for slug: ${slug}`);
            return NextResponse.json({ revalidated: true, now: Date.now() });
        }

        return NextResponse.json({ message: "Slug is required" }, { status: 400 });
    } catch (err) {
        console.error("[Revalidate] Error:", err);
        return NextResponse.json({ message: "Error revalidating" }, { status: 500 });
    }
}
