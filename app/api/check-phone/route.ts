import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function POST(req: NextRequest) {
    try {
        const { phoneNumber } = await req.json();

        if (!phoneNumber) {
            return NextResponse.json(
                { error: "Phone number is required" },
                { status: 400 }
            );
        }

        // Check if user exists with this phone number
        const existingUser = await prisma.user.findUnique({
            where: { phoneNumber },
            select: { id: true }
        });

        return NextResponse.json({
            exists: !!existingUser,
            phoneNumber
        });
    } catch (error) {
        console.error("Error checking phone number:", error);
        return NextResponse.json(
            { error: "Failed to check phone number" },
            { status: 500 }
        );
    }
}
