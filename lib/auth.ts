import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./db/prisma";
import { username } from "better-auth/plugins";
import { senMail } from "@/services/nodeMailer.services";
import { AuthUser, GoogleProfile, FacebookProfile, TikTokProfile } from "@/types/auth";
import { APP_URL } from "@/config/env";

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    plugins: [
        username(),
    ],
    accountLinking: {
        enabled: true,
        trustedProviders: ["google", "facebook", "tiktok"],
    },
    databaseHooks: {
        user: {
            create: {
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
    baseURL: APP_URL,
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
            phoneVerified: {
                type: "boolean",
                required: false,
                defaultValue: false,
            },
            otp: {
                type: "string",
                required: false,
            },
            otpExpiresAt: {
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

        }
    },
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
            mapProfileToUser: (profile: GoogleProfile) => {
                const uniqueId = profile.id || profile.sub || Math.random().toString(36).slice(-5);
                return {
                    username: (profile.email.split("@")[0] + "_" + uniqueId.slice(-5)).toLowerCase(),
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
