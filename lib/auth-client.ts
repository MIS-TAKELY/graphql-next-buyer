import { createAuthClient } from "better-auth/react"
import { CANONICAL_URL } from "@/config/env";
import { usernameClient, phoneNumberClient, emailOTPClient } from "better-auth/client/plugins"

export const authClient = createAuthClient({
    baseURL: CANONICAL_URL,
    plugins: [
        usernameClient(),
        phoneNumberClient(),
        emailOTPClient(),
        {
            id: "phone-password",
            getActions: (client) => ({
                signInPhone: async (data: { phone: string, password: string, rememberMe?: boolean }) => {
                    return client("/phone-password/sign-in-phone", {
                        method: "POST",
                        body: data
                    })
                }
            })
        }
    ]
})

export const { signIn, signUp, useSession, signOut, sendVerificationEmail } = authClient;
