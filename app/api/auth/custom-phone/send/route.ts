import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { sendWhatsAppOTP } from "@/lib/whatsapp";
import crypto from "crypto";
import { rateLimit } from "@/services/rateLimit.service";

export async function POST(req: NextRequest) {
    try {
        const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
        const allowed = await rateLimit(`rl:custom-phone-send:${ip}`, 3, 300);
        if (!allowed) {
            return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
        }

        const { phoneNumber } = await req.json();

        if (!phoneNumber) {
            return NextResponse.json({ error: "Phone number is required" }, { status: 400 });
        }

        const phoneRegex = /^\+?[1-9]\d{7,14}$/;
        const cleanPhone = phoneNumber.replace(/\s|-/g, "");
        if (!phoneRegex.test(cleanPhone)) {
            return NextResponse.json({ error: "Invalid phone number format" }, { status: 400 });
        }

        const otp = crypto.randomInt(100000, 999999).toString();
        const identifier = `custom_phone:${cleanPhone.replace(/\D/g, "")}`;
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

        await prisma.verification.deleteMany({
            where: { identifier }
        });

        await prisma.verification.create({
            data: {
                identifier,
                value: otp,
                expiresAt,
            }
        });

        await sendWhatsAppOTP(phoneNumber, otp);

        return NextResponse.json({ success: true, message: "OTP sent successfully" });
    } catch (error) {
        console.error("Error sending custom OTP:", error);
        return NextResponse.json(
            { error: "Failed to send OTP" },
            { status: 500 }
        );
    }
}
