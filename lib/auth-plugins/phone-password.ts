import { createAuthEndpoint } from "@better-auth/core/api";
import { APIError } from "better-call";
import { setSessionCookie } from "better-auth/cookies";
import { BASE_ERROR_CODES } from "@better-auth/core/error";
import * as z from "zod";
import type { BetterAuthPlugin } from "better-auth";
import { senMail } from "@/services/nodeMailer.services";
import { sendWhatsAppOTP } from "@/lib/whatsapp";
import * as crypto from "crypto";

const signInPhoneBodySchema = z.object({
    phone: z.string().meta({ description: "The phone number of the user" }),
    password: z.string().meta({ description: "The password of the user" }),
    rememberMe: z.boolean().meta({ description: "Remember the user session" }).optional(),
});

export const phonePassword = () => {
    return {
        id: "phone-password",
        endpoints: {
            signInPhone: createAuthEndpoint("/phone-password/sign-in-phone", {
                method: "POST",
                body: signInPhoneBodySchema,
            }, async (ctx) => {
                const { phone, password, rememberMe } = ctx.body;

                // 1. Find user by phone number
                // Note: The schema now uses 'phoneNumber' field
                const user = await ctx.context.adapter.findOne({
                    model: "user",
                    where: [{
                        field: "phoneNumber",
                        value: phone,
                    }]
                }) as any;

                if (!user) {
                    // Hash input password to prevent timing attacks
                    await ctx.context.password.hash(password);
                    throw new APIError("UNAUTHORIZED", { message: "Invalid phone number or password" });
                }

                // 2. Find credential account for the user
                const account = await ctx.context.adapter.findOne({
                    model: "account",
                    where: [
                        { field: "userId", value: user.id },
                        { field: "providerId", value: "credential" }
                    ]
                }) as any;

                if (!account || !account.password) {
                    throw new APIError("UNAUTHORIZED", { message: "Invalid phone number or password" });
                }

                // 3. Verify password
                const isPasswordValid = await ctx.context.password.verify({
                    hash: account.password,
                    password: password
                });

                if (!isPasswordValid) {
                    throw new APIError("UNAUTHORIZED", { message: "Invalid phone number or password" });
                }

                // 4. Check if phone is verified if required (optional, usually good to have)
                // For now we follow the user's request which is just "phone and password login"

                // 5. Create session
                const session = await ctx.context.internalAdapter.createSession(user.id, rememberMe === false);
                if (!session) {
                    throw new APIError("INTERNAL_SERVER_ERROR", { message: BASE_ERROR_CODES.FAILED_TO_CREATE_SESSION });
                }

                // 6. Set session cookie
                await setSessionCookie(ctx, {
                    session,
                    user
                }, rememberMe === false);

                return ctx.json({
                    token: session.token,
                    user: {
                        id: user.id as string,
                        email: user.email as string,
                        name: user.name as string,
                        image: user.image as string | null,
                        phoneNumber: user.phoneNumber as string | null,
                        phoneNumberVerified: user.phoneNumberVerified as boolean,
                        createdAt: user.createdAt as Date,
                        updatedAt: user.updatedAt as Date
                    }
                });
            }),

            sendForgotPasswordOtp: createAuthEndpoint("/phone-password/send-forgot-password-otp", {
                method: "POST",
                body: z.object({
                    identifier: z.string(),
                }),
            }, async (ctx) => {
                const { identifier } = ctx.body;
                const isEmail = identifier.includes("@");
                let user;

                if (isEmail) {
                    user = await ctx.context.adapter.findOne({
                        model: "user",
                        where: [{ field: "email", value: identifier }]
                    }) as any;
                } else {
                    // Assume phone
                    user = await ctx.context.adapter.findOne({
                        model: "user",
                        where: [{ field: "phoneNumber", value: identifier }]
                    }) as any;
                }

                if (!user) {
                    // Return success even if user not found to prevent enumeration
                    return ctx.json({ success: true });
                }

                const otp = crypto.randomInt(100000, 999999).toString();
                const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

                if (isEmail) {
                    await ctx.context.adapter.update({
                        model: "user",
                        where: [{ field: "id", value: user.id }],
                        update: {
                            emailOtp: otp,
                            emailOtpExpiresAt: expiresAt
                        }
                    });
                    await senMail(user.email, "VERIFICATION_OTP", { otp, name: user.name || "User" });
                } else {
                    await ctx.context.adapter.update({
                        model: "user",
                        where: [{ field: "id", value: user.id }],
                        update: {
                            otp: otp,
                            otpExpiresAt: expiresAt
                        }
                    });
                    await sendWhatsAppOTP(user.phoneNumber, otp);
                }

                return ctx.json({ success: true, isEmail });
            }),

            resetPasswordWithOtp: createAuthEndpoint("/phone-password/reset-password-with-otp", {
                method: "POST",
                body: z.object({
                    identifier: z.string(),
                    otp: z.string(),
                    password: z.string(),
                }),
            }, async (ctx) => {
                const { identifier, otp, password } = ctx.body;
                const isEmail = identifier.includes("@");
                let user;

                if (isEmail) {
                    user = await ctx.context.adapter.findOne({
                        model: "user",
                        where: [{ field: "email", value: identifier }]
                    }) as any;
                } else {
                    user = await ctx.context.adapter.findOne({
                        model: "user",
                        where: [{ field: "phoneNumber", value: identifier }]
                    }) as any;
                }

                if (!user) {
                    throw new APIError("UNAUTHORIZED", { message: "Invalid Request" });
                }

                if (isEmail) {
                    if (!user.emailOtp || user.emailOtp !== otp || new Date() > new Date(user.emailOtpExpiresAt)) {
                        throw new APIError("UNAUTHORIZED", { message: "Invalid or expired OTP" });
                    }
                } else {
                    if (!user.otp || user.otp !== otp || new Date() > new Date(user.otpExpiresAt)) {
                        throw new APIError("UNAUTHORIZED", { message: "Invalid or expired OTP" });
                    }
                }

                const hashedPassword = await ctx.context.password.hash(password);

                // Update password for credential account
                const account = await ctx.context.adapter.findOne({
                    model: "account",
                    where: [
                        { field: "userId", value: user.id },
                        { field: "providerId", value: "credential" }
                    ]
                }) as any;

                if (account) {
                    await ctx.context.adapter.update({
                        model: "account",
                        where: [{ field: "id", value: account.id }],
                        update: { password: hashedPassword }
                    });
                } else {
                    // Create credential account if not exists? (Edge case). For reset password, usually assume account exists.
                    throw new APIError("BAD_REQUEST", { message: "Account not found" });
                }

                // Clear OTP
                if (isEmail) {
                    await ctx.context.adapter.update({
                        model: "user",
                        where: [{ field: "id", value: user.id }],
                        update: { emailOtp: null, emailOtpExpiresAt: null }
                    });
                } else {
                    await ctx.context.adapter.update({
                        model: "user",
                        where: [{ field: "id", value: user.id }],
                        update: { otp: null, otpExpiresAt: null }
                    });
                }

                return ctx.json({ success: true });
            }),
        },
    } satisfies BetterAuthPlugin;
};
