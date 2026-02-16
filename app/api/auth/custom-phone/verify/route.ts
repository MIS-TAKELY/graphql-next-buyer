import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { rateLimit } from "@/services/rateLimit.service";

export async function POST(req: NextRequest) {
    try {
        const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

        const { phoneNumber, code } = await req.json();

        if (!phoneNumber || !code) {
            return NextResponse.json({ error: "Phone number and code are required" }, { status: 400 });
        }

        if (!/^\d{6}$/.test(code)) {
            return NextResponse.json({ error: "OTP must be a 6-digit number" }, { status: 400 });
        }

        const cleanPhone = phoneNumber.replace(/\D/g, "");
        const rateLimitKey = `rl:custom-phone-verify:${ip}:${cleanPhone}`;
        const allowed = await rateLimit(rateLimitKey, 5, 300);
        if (!allowed) {
            return NextResponse.json({ error: "Too many attempts. Please try again later." }, { status: 429 });
        }

        const identifier = `custom_phone:${cleanPhone}`;

        const verification = await prisma.verification.findFirst({
            where: {
                identifier,
                value: code,
                expiresAt: {
                    gt: new Date()
                }
            }
        });

        if (!verification) {
            return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 400 });
        }

        await prisma.verification.delete({
            where: { id: verification.id }
        });

        return NextResponse.json({ success: true, message: "Phone verified successfully" });
    } catch (error) {
        console.error("Error verifying custom OTP:", error);
        return NextResponse.json(
            { error: "Failed to verify OTP" },
            { status: 500 }
        );
    }
}
