// lib/apollo/server.ts
import { ApolloClient, createHttpLink } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { auth } from "@clerk/nextjs/server";
import { APOLLO_CONFIG, APOLLO_DEFAULT_OPTIONS } from "./config";

export async function getServerApolloClient() {
  let token: string | null = null;

  try {
    const authData = await auth();
    token = await authData.getToken();
  } catch (err) {
    console.error("[Apollo Server] Auth error:", err);
  }

  const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")).replace(/\/$/, "");
  const uri = `${baseUrl}/api/graphql`;

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
