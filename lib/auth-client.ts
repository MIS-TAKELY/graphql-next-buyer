import { createAuthClient } from "better-auth/react"
import { usernameClient } from "better-auth/client/plugins"

export const authClient = createAuthClient({
    baseURL: process.env.NODE_ENV === "production" ? "https://www.vanijay.com" : (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
    plugins: [
        usernameClient(),
    ]
})

export const { signIn, signUp, useSession, signOut, sendVerificationEmail } = authClient;
