// lib/apollo/ssr-provider.tsx (Most robust version)
"use client";

import { ApolloClient, ApolloProvider, createHttpLink } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { useAuth } from "@clerk/nextjs";
import { useMemo } from "react";
import { APOLLO_CONFIG, APOLLO_DEFAULT_OPTIONS } from "./config";

interface SSRApolloProviderProps {
  children: React.ReactNode;
  initialData?: {
    addresses?: any[];
    userProfile?: any;
    products?: any[];
    currentProduct?: any;
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

    console.log("auth link-->", authLink);

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

    // console.log("inner cllient-->",client)

    // Hydrate cache with initial data
    if (initialData) {
      try {
        // Write addresses
        if (initialData.addresses) {
          client.cache.writeQuery({
            query: require("@/client/address/address.queries")
              .GET_ADDRESS_OF_USER,
            data: { getAddressOfUser: initialData.addresses },
          });
        }

        // Write user profile
        if (initialData.userProfile) {
          client.cache.writeQuery({
            query: require("@/client/user/user.queries")
              .GET_USER_PROFILE_DETAILS,
            data: initialData.userProfile,
          });
        }

        // Write products (most important for your case)
        if (initialData.products && Array.isArray(initialData.products)) {
          let productsToCache = [...initialData.products];

          // If we have a current product that's not in the products array, add it
          if (initialData.currentProduct) {
            const productExists = productsToCache.some(
              (p) => p.id === initialData.currentProduct.id
            );
            if (!productExists) {
              productsToCache.push(initialData.currentProduct);
            }
          }

          client.cache.writeQuery({
            query: require("@/client/product/product.queries").GET_PRODUCTS,
            data: { getProducts: productsToCache },
          });

          // console.log(`✅ Cached ${productsToCache.length} products`);
        }
      } catch (error) {
        console.error("❌ Error hydrating Apollo cache:", error);
        // Don't throw - let the app continue with an empty cache
      }
    }

    return client;
  }, [
    getToken,
    initialData?.addresses,
    initialData?.userProfile,
    initialData?.products,
    initialData?.currentProduct,
  ]);

  // console.log("outter cllient-->",client)

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}
