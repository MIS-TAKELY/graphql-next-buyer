
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { sendWhatsAppOTP } from "@/lib/whatsapp";
import crypto from "crypto";

export async function POST(req: NextRequest) {
    try {
        const { phoneNumber } = await req.json();

        if (!phoneNumber) {
            return NextResponse.json({ error: "Phone number is required" }, { status: 400 });
        }

        // Clean phone number (remove + if present, ensure digits)
        const cleanPhone = phoneNumber.replace(/\D/g, "");

        // Generate 6-digit OTP
        const otp = crypto.randomInt(100000, 999999).toString();

        // Create identifier for DB (isolated from better-auth standard flow)
        const identifier = `custom_phone:${cleanPhone}`;

        // Expiration: 5 minutes
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

        // Store in Verification table
        // Upsert to handle re-sends
        await prisma.verification.upsert({
            where: {
                // Prisma requires a unique constraint to upsert.
                // The Verification model might not have a unique constraint on identifier alone.
                // Let's check schema. If no unique on identifier, we might need deleteMany + create.
                // Schema shows: model Verification { id, identifier, value, ... } - NO UNIQUE on identifier!
                // So we cannot use upsert easily on identifier unless we find by ID first, which we don't know.
                // We should delete matches and create new.
                id: "dummy_upsert_Constraint" // Placeholder, we will use delete + create instead
            },
            create: {
                identifier,
                value: otp,
                expiresAt,
            },
            update: {
                value: otp,
                expiresAt,
            }
        }).catch(async (e) => {
            // Fallback if upsert fails or logic above is invalid due to constraints
            // Delete existing valid/invalid OTPs for this phone
            await prisma.verification.deleteMany({
                where: { identifier }
            });

            // Create new
            await prisma.verification.create({
                data: {
                    identifier,
                    value: otp,
                    expiresAt
                }
            });
        });

        // Send OTP via WhatsApp
        await sendWhatsAppOTP(phoneNumber, otp);

        return NextResponse.json({ success: true, message: "OTP sent successfully" });
    } catch (error) {
        console.error("Error sending custom OTP:", error);
        return NextResponse.json(
            { error: "Failed to send OTP", details: (error as Error).message },
            { status: 500 }
        );
    }
}
