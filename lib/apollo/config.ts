// lib/apollo/config.ts
import { DefaultOptions, InMemoryCache } from "@apollo/client";

export const APOLLO_CACHE_CONFIG = {
  typePolicies: {
    Query: {
      fields: {
        getProducts: { merge: false },
        getMyCart: { merge: false },
        categories: { merge: false },
        getAddressOfUser: { merge: false },
        getUserProfileDetails: { merge: false },
      },
    },
    Product: {
      fields: {
        reviews: { merge: false },
        images: { merge: false },
        variants: { merge: false },
      },
    },
  },
};

export const APOLLO_CONFIG = {
  defaultOptions: {
    watchQuery: {
      errorPolicy: "all",
      notifyOnNetworkStatusChange: false,
      fetchPolicy: "cache-first",
    },
    query: {
      errorPolicy: "all",
      fetchPolicy: "cache-first",
    },
  },

  // Keep this for client-side usage if needed, but ideally we should instantiate it.
  // This instance is a singleton if imported!
  // Consumers should prefer creating new InMemoryCache(APOLLO_CACHE_CONFIG)
  cache: new InMemoryCache(APOLLO_CACHE_CONFIG),
};

export const APOLLO_DEFAULT_OPTIONS: DefaultOptions = {
  watchQuery: {
    fetchPolicy: "cache-first",
    errorPolicy: "all",
    notifyOnNetworkStatusChange: false,
  },
  query: {
    fetchPolicy: "cache-first",
    errorPolicy: "all",
  },
  mutate: {
    fetchPolicy: "network-only",
    errorPolicy: "all",
  },
};
