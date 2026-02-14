
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function POST(req: NextRequest) {
    try {
        const { phoneNumber, code } = await req.json();

        if (!phoneNumber || !code) {
            return NextResponse.json({ error: "Phone number and code are required" }, { status: 400 });
        }

        const cleanPhone = phoneNumber.replace(/\D/g, "");
        const identifier = `custom_phone:${cleanPhone}`;

        // Find verification record
        const verification = await prisma.verification.findFirst({
            where: {
                identifier,
                value: code,
                expiresAt: {
                    gt: new Date() // Must not be expired
                }
            }
        });

        if (!verification) {
            return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 400 });
        }

        // OTP is valid. Consume it (delete) to prevent reuse.
        await prisma.verification.delete({
            where: { id: verification.id }
        });

        return NextResponse.json({ success: true, message: "Phone verified successfully" });

    } catch (error) {
        console.error("Error verifying custom OTP:", error);
        return NextResponse.json(
            { error: "Failed to verify OTP", details: (error as Error).message },
            { status: 500 }
        );
    }
}
