// lib/apollo/ssr-provider.tsx
"use client";

import { ApolloClient, ApolloProvider, createHttpLink } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { useAuth } from "@clerk/nextjs";
import { useMemo } from "react";
import { APOLLO_CONFIG, APOLLO_DEFAULT_OPTIONS } from "./config";

// Update initialData type to accept multiple queries
interface SSRApolloProviderProps {
  children: React.ReactNode;
  initialData?: {
    addresses?: any[];
    userProfile?: any; // add any other prefetched queries here
  };
}

export function SSRApolloProvider({
  children,
  initialData,
}: SSRApolloProviderProps) {
  const { getToken } = useAuth();

  const client = useMemo(() => {
    const authLink = setContext(async (_, { headers }) => {
      const token = await getToken();
      return {
        headers: { ...headers, authorization: token ? `Bearer ${token}` : "" },
      };
    });

    const httpLink = createHttpLink({
      uri:
        `${process.env.NEXT_PUBLIC_APP_URL}/api/graphql` ||
        "http://localhost:3000/api/graphql",
    });

    const client = new ApolloClient({
      link: authLink.concat(httpLink),
      cache: APOLLO_CONFIG.cache,
      defaultOptions: APOLLO_DEFAULT_OPTIONS,
    });

    // Hydrate multiple prefetched queries into the cache
    if (initialData) {
      if (initialData.addresses) {
        client.cache.writeQuery({
          query: require("@/client/address/address.queries")
            .GET_ADDRESS_OF_USER,
          data: { getAddressOfUser: initialData.addresses },
        });
      }

      if (initialData.userProfile) {
        client.cache.writeQuery({
          query: require("@/client/user/user.queries").GET_USER_PROFILE_DETAILS,
          data: initialData.userProfile,
        });
      }

      // Add more queries here as needed in the future
    }

    return client;
  }, [getToken, initialData]);

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}
