// lib/apollo/server.ts
import { ApolloClient, createHttpLink } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { SchemaLink } from "@apollo/client/link/schema";
import { auth } from "@clerk/nextjs/server";
import { schema } from "@/servers/gql";
import { createContext } from "@/servers/gql/context";
import { APOLLO_CONFIG, APOLLO_DEFAULT_OPTIONS } from "./config";

export async function getServerApolloClient() {
  let token: string | null = null;

  try {
    // In Next.js 15, auth() calls headers() which triggers dynamic rendering.
    // During build/SSG, this throws a DynamicServerError.
    // We wrap this to allow the build to proceed without a token.
    const authData = await auth();
    token = await authData.getToken();
  } catch (err: any) {
    // If we're in a build context or auth fails, we just continue without a token
    if (process.env.NODE_ENV === "production") {
      // Avoid spamming logs during build unless it's a real error
      const isDynamicError = err?.message?.includes("Dynamic server usage") ||
        err?.digest === 'DYNAMIC_SERVER_USAGE';
      if (!isDynamicError) {
        console.error("[Apollo Server] Auth error:", err);
      }
    } else {
      console.error("[Apollo Server] Auth error:", err);
    }
  }

  const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")).replace(/\/$/, "");
  const uri = `${baseUrl}/api/graphql`;

  // Use SchemaLink for local/build environment to avoid ECONNREFUSED
  // Only if we are on the server (typeof window === "undefined")
  if (typeof window === "undefined" && uri.includes("localhost")) {
    if (process.env.NODE_ENV === "production") {
      console.log(`[Apollo Server] Using SchemaLink for local/build environment`);
    }
    return new ApolloClient({
      link: new SchemaLink({
        schema,
        context: async () => await createContext()
      }),
      cache: APOLLO_CONFIG.cache,
      defaultOptions: APOLLO_DEFAULT_OPTIONS,
    });
  }

  if (process.env.NODE_ENV === "production") {
    console.log(`[Apollo Server] Constructing URI: ${uri}`);
  }

  const httpLink = createHttpLink({
    uri,
  });

  const authLink = setContext((_, { headers }) => ({
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    },
  }));

  return new ApolloClient({
    link: authLink.concat(httpLink),
    cache: APOLLO_CONFIG.cache,
    defaultOptions: APOLLO_DEFAULT_OPTIONS,
  });
}
