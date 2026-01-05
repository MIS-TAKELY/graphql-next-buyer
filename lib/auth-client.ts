import { createAuthClient } from "better-auth/react"
import { APP_URL } from "@/config/env";
import { usernameClient } from "better-auth/client/plugins"

export const authClient = createAuthClient({
    baseURL: APP_URL,
    plugins: [
        usernameClient(),
    ]
})

export const { signIn, signUp, useSession, signOut, sendVerificationEmail } = authClient;
