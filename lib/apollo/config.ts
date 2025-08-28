// lib/apollo/config.ts
import { DefaultOptions, InMemoryCache } from "@apollo/client";

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

  
  cache: new InMemoryCache({
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
  }),
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
    fetchPolicy: "no-cache",
    errorPolicy: "all",
  },
};
