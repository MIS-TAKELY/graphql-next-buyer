import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { rateLimit } from "@/services/rateLimit.service";

export async function POST(req: NextRequest) {
    try {
        const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
        const allowed = await rateLimit(`rl:check-phone:${ip}`, 10, 60);
        if (!allowed) {
            return NextResponse.json(
                { error: "Too many requests. Please try again later." },
                { status: 429 }
            );
        }

        const { phoneNumber } = await req.json();

        if (!phoneNumber) {
            return NextResponse.json(
                { error: "Phone number is required" },
                { status: 400 }
            );
        }

        const phoneRegex = /^\+?[1-9]\d{7,14}$/;
        const cleanPhone = phoneNumber.replace(/\s|-/g, "");
        if (!phoneRegex.test(cleanPhone)) {
            return NextResponse.json(
                { error: "Invalid phone number format" },
                { status: 400 }
            );
        }

        const existingUser = await prisma.user.findUnique({
            where: { phoneNumber: cleanPhone },
            select: { id: true }
        });

        return NextResponse.json({
            exists: !!existingUser,
            phoneNumber: cleanPhone
        });
    } catch (error) {
        console.error("Error checking phone number:", error);
        return NextResponse.json(
            { error: "Failed to check phone number" },
            { status: 500 }
        );
    }
}
