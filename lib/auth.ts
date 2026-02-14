import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./db/prisma";
import { username, phoneNumber, emailOTP } from "better-auth/plugins";
import { phonePassword } from "./auth-plugins/phone-password";
import { senMail } from "@/services/nodeMailer.services";
import { sendWhatsAppOTP } from "@/lib/whatsapp";
import { AuthUser, GoogleProfile, FacebookProfile, TikTokProfile } from "@/types/auth";
import { APP_URL, CANONICAL_URL } from "@/config/env";

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    plugins: [
        username(),
        phoneNumber({
            sendOTP: async ({ phoneNumber, code }) => {
                // Send OTP without checking for existing users
                // Phone verification is now optional and doesn't create users
                const cleanCode = code.includes(":") ? code.split(":")[0] : code;
                await sendWhatsAppOTP(phoneNumber, cleanCode);
            },
            // Disable automatic user creation on phone verification
            // Users are only created when they verify their email or use OAuth
        }),
        emailOTP({
            sendVerificationOTP: async ({ email, otp, type }) => {
                await senMail(email, "VERIFICATION_OTP", { otp, name: "User" });
            },
        }),
        phonePassword(),
    ],
    accountLinking: {
        enabled: true,
        trustedProviders: ["google", "facebook", "tiktok"],
    },
    databaseHooks: {
        user: {
            create: {
                before: async (user) => {
                    console.log("BETTER-AUTH: user.create.before mapping payload:", JSON.stringify(user, null, 2));

                    // Ensure name is at least an empty string if missing (Prisma default usually handles this but safety first)
                    if (!user.name && user.email) {
                        user.name = user.email.split("@")[0];
                    }

                    // Ensure username exists to satisfy Prisma unique constraint
                    // Social providers like Google don't return a 'username' by default
                    if (!user.username || (typeof user.username === 'string' && user.username.trim() === "")) {
                        const randomId = Math.random().toString(36).substring(2, 7);
                        const emailPrefix = user.email ? user.email.split("@")[0] : "user";
                        user.username = (emailPrefix + "_" + randomId).toLowerCase().replace(/[^a-z0-9_]/g, "");
                    }
                    return { data: user };
                },
                after: async (user) => {
                    try {
                        console.log("BETTER-AUTH: User created successfully:", user.email);
                        await prisma.userRole.create({
                            data: {
                                userId: user.id,
                                role: "BUYER",
                            },
                        });
                    } catch (err) {
                        console.error("BETTER-AUTH: Critical error in after.user.create hook:", err);
                        // We don't throw here to avoid failing the whole sign-in, 
                        // but the user might be missing a role.
                    }
                },
            },
        },
    },
    baseURL: CANONICAL_URL,
    trustedOrigins: [
        APP_URL,
        "https://www.vanijay.com",
        "https://vanijay.com",
        "http://localhost:3000",
    ],
    advanced: {
        useSecureCookies: true,
        cookieDomain: ".vanijay.com",
    },
    cors: {
        enabled: true,
        origin: [
            "https://www.vanijay.com",
            "https://vanijay.com",
            "http://localhost:3000"
        ],
    },
    emailVerification: {
        sendOnSignUp: true,
        autoSignInAfterVerification: true,
        sendVerificationEmail: async ({ user, url }: { user: AuthUser; url: string }) => {
            console.log("BETTER-AUTH: triggering sendVerificationEmail for", user.email);
            console.log("BETTER-AUTH: verification URL:", url);
            try {
                await senMail(user.email, "VERIFICATION", { url, name: (user.name || user.firstName || "User") as string });
                console.log("BETTER-AUTH: senMail call completed");
            } catch (err) {
                console.error("BETTER-AUTH: Error in sendVerificationEmail hook:", err);
            }
        },
    },
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: true,
        resetPasswordTokenExpiresIn: 600, // 10 minutes
        sendResetPassword: async ({ user, url }: { user: AuthUser; url: string }) => {
            console.log("BETTER-AUTH: triggering sendResetPassword for", user.email);
            try {
                await senMail(user.email, "PASSWORD_RESET", { url, name: (user.name || user.firstName || "User") as string });
                console.log("BETTER-AUTH: senMail call completed for password reset");
            } catch (err) {
                console.error("BETTER-AUTH: Error in sendResetPassword hook:", err);
            }
        },
    },
    user: {
        additionalFields: {
            otp: {
                type: "string",
                required: false,
            },
            otpExpiresAt: {
                type: "date",
                required: false,
            },
            emailOtp: {
                type: "string",
                required: false,
            },
            emailOtpExpiresAt: {
                type: "date",
                required: false,
            },
            firstName: {
                type: "string",
                required: false,
            },
            lastName: {
                type: "string",
                required: false,
            },
            avatarImageUrl: {
                type: "string",
                required: false,
            },
            phoneNumber: {
                type: "string",
                required: false,
            },
            phoneNumberVerified: {
                type: "boolean",
                required: false,
            },
        }
    },
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
            // We rely on databaseHooks.user.create.before to generate the username
            // and handle optional fields mapping automatically.
        },
        facebook: {
            clientId: process.env.FACEBOOK_CLIENT_ID as string,
            clientSecret: process.env.FACEBOOK_CLIENT_SECRET as string,
            // Default mapping works fine, username generated in hooks.
        },
        tiktok: {
            clientId: process.env.TIKTOK_CLIENT_ID as string,
            clientSecret: process.env.TIKTOK_CLIENT_SECRET as string,
            mapProfileToUser: (profile: TikTokProfile) => {
                const uniqueId = profile.open_id || profile.id || Math.random().toString(36).slice(-5);
                const display_name = profile.display_name || "TikTok User";
                const email = profile.email || `tiktok_${uniqueId.slice(-10)}@vanijay.temp`;
                return {
                    username: ("tiktok_" + uniqueId.slice(-10)).toLowerCase(),
                    email,
                    firstName: display_name.split(" ")[0],
                    lastName: display_name.split(" ").slice(1).join(" ") || "",
                    emailVerified: true,
                };
            },
        },
    } as any,
});