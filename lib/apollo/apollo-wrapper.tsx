"use client";
import { ApolloClient, ApolloProvider, createHttpLink, InMemoryCache } from "@apollo/client";
import { useMemo } from "react";
import { APOLLO_CONFIG, APOLLO_DEFAULT_OPTIONS, APOLLO_CACHE_CONFIG } from "./config";
import { APP_URL } from "@/config/env";

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
  const client = useMemo(() => {
    const baseUrl = APP_URL.replace(/\/$/, "");

    const httpLink = createHttpLink({
      uri: typeof window !== "undefined"
        ? "/api/graphql"
        : `${baseUrl}/api/graphql`,
    });

    const client = new ApolloClient({
      link: httpLink,
      cache: new InMemoryCache(APOLLO_CACHE_CONFIG),
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

        // Write products
        const productsArray = Array.isArray(initialData.products) ? initialData.products : [];
        let productsToCache = [...productsArray];

        // If we have a current product, ensure it's in the cache for multiple queries
        if (initialData.currentProduct) {
          const product = initialData.currentProduct;

          // 1. Write to GET_PRODUCT_BY_SLUG for the detail page
          if (product.slug) {
            try {
              client.cache.writeQuery({
                query: require("@/client/product/product.queries").GET_PRODUCT_BY_SLUG,
                variables: { slug: product.slug },
                data: { getProductBySlug: product },
              });
            } catch (e) {
              console.error("Error writing current product to GET_PRODUCT_BY_SLUG:", e);
            }
          }

          // 2. Also ensure it's in the main products list if we're hydrating that
          if (productsArray.length > 0) {
            const productExists = productsToCache.some((p) => p.id === product.id);
            if (!productExists) {
              productsToCache.push(product);
            }
          }
        }

        if (productsToCache.length > 0) {
          try {
            client.cache.writeQuery({
              query: require("@/client/product/product.queries").GET_PRODUCTS,
              data: { getProducts: productsToCache },
            });
          } catch (e) {
            console.error("Error writing products to GET_PRODUCTS:", e);
          }
        }
      } catch (error) {
        console.error("❌ Error hydrating Apollo cache:", error);
        // Don't throw - let the app continue with an empty cache
      }
    }

    return client;
  }, [
    initialData?.addresses,
    initialData?.userProfile,
    initialData?.products,
    initialData?.currentProduct,
  ]);

  // console.log("outter cllient-->",client)

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}
