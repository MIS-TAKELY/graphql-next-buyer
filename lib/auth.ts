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
                // Check if the phone number is already linked to an existing user
                const existingUser = await prisma.user.findFirst({
                    where: { phoneNumber: phoneNumber }
                });

                if (existingUser && existingUser.emailVerified) {
                    throw new Error("This phone number is already associated with a verified account.");
                }

                const cleanCode = code.includes(":") ? code.split(":")[0] : code;
                await sendWhatsAppOTP(phoneNumber, cleanCode);
            },
            // Disable automatic user creation on phone verification
            // This ensures users are only created when they provide an email and verify it.
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
        verification: {
            create: {
                before: async (verification) => {
                    // Ensure NO 'phone:' prefix (Better-Auth version 1.4.7 search logic seems to omit it)
                    if (verification.identifier.startsWith("phone:")) {
                        verification.identifier = verification.identifier.replace("phone:", "");
                    }
                    // Remove suffix ':0' or ':1' if present (bug workaround for certain environments/adapters)
                    if (verification.value.includes(":")) {
                        verification.value = verification.value.split(":")[0];
                    }
                    return { data: verification };
                },
            },
        },
        user: {
            create: {
                before: async (user) => {
                    // Ensure username exists to satisfy Prisma unique constraint
                    if (!user.username) {
                        const randomId = Math.random().toString(36).substring(2, 7);
                        if (user.email.includes("@vanijay.temp")) {
                            user.username = user.email.split("@")[0] + "_" + randomId;
                        } else {
                            user.username = (user.email.split("@")[0] + "_" + randomId).toLowerCase();
                        }
                    }
                    return { data: user };
                },
                after: async (user) => {
                    console.log("BETTER-AUTH: User created successfully:", user.email);
                    await prisma.userRole.create({
                        data: {
                            userId: user.id,
                            role: "BUYER",
                        },
                    });
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
            mapProfileToUser: (profile: GoogleProfile) => {
                const uniqueId = profile.id || profile.sub || Math.random().toString(36).slice(-5);
                const email = profile.email || `${uniqueId}@google.com`;
                return {
                    username: (email.split("@")[0] + "_" + uniqueId.slice(-5)).toLowerCase(),
                    firstName: profile.given_name,
                    lastName: profile.family_name,
                    emailVerified: true,
                };
            },
        },
        facebook: {
            clientId: process.env.FACEBOOK_CLIENT_ID as string,
            clientSecret: process.env.FACEBOOK_CLIENT_SECRET as string,
            mapProfileToUser: (profile: FacebookProfile) => {
                const uniqueId = profile.id || Math.random().toString(36).slice(-5);
                const email = profile.email || `${uniqueId}@facebook.com`;
                return {
                    username: (email.split("@")[0] + "_" + uniqueId.slice(-5)).toLowerCase(),
                    firstName: profile.first_name,
                    lastName: profile.last_name,
                    emailVerified: true,
                };
            },
        },
        tiktok: {
            clientId: process.env.TIKTOK_CLIENT_ID as string,
            clientSecret: process.env.TIKTOK_CLIENT_SECRET as string,
            mapProfileToUser: (profile: TikTokProfile) => {
                const uniqueId = profile.open_id || profile.id || Math.random().toString(36).slice(-5);
                const display_name = profile.display_name || "TikTok User";
                return {
                    username: ("tiktok_" + uniqueId.slice(-10)).toLowerCase(),
                    firstName: display_name.split(" ")[0],
                    lastName: display_name.split(" ").slice(1).join(" ") || "",
                    emailVerified: true,
                };
            },
        },
    } as any,
});