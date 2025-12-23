import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./db/prisma";
import { username } from "better-auth/plugins";
import { senMail } from "@/services/nodeMailer.services";

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
    baseURL: process.env.NODE_ENV === "production" ? "https://www.vanijay.com" : (process.env.BETTER_AUTH_URL || "http://localhost:3000"),
    trustedOrigins: [
        "https://www.vanijay.com",
        "https://vanijay.com",

    ],
    advanced: {
        useSecureCookies: true,
    },
    emailVerification: {
        sendOnSignUp: true,
        autoSignInAfterVerification: true,
        sendVerificationEmail: async ({ user, url }: { user: any; url: string }) => {
            console.log("BETTER-AUTH: triggering sendVerificationEmail for", user.email);
            console.log("BETTER-AUTH: verification URL:", url);
            try {
                await senMail(user.email, "VERIFICATION", { url, name: user.name || user.firstName });
                console.log("BETTER-AUTH: senMail call completed");
            } catch (err) {
                console.error("BETTER-AUTH: Error in sendVerificationEmail hook:", err);
            }
        },
    },
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: true,
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
            mapProfileToUser: (profile: any) => {
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
            mapProfileToUser: (profile: any) => {
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
            mapProfileToUser: (profile: any) => {
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
