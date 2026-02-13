import { createAuthClient } from "better-auth/react"
import { CANONICAL_URL } from "@/config/env";
import { usernameClient, phoneNumberClient } from "better-auth/client/plugins"

export const authClient = createAuthClient({
    baseURL: CANONICAL_URL,
    plugins: [
        usernameClient(),
        phoneNumberClient(),
    ]
})

export const { signIn, signUp, useSession, signOut, sendVerificationEmail } = authClient;
