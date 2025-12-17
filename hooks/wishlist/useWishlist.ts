// types/wishlist.types.ts
export interface Product {
  id: string;
  name: string;
  __typename?: "Product";
  variants: Array<{
    id: string;
    price: string;
    mrp?: string;
    stock?: string;
  }>;
  images: Array<{
    url: string;
  }>;
}

export interface WishlistItem {
  id: string;
  wishlistId: string;
  productId: string;
  __typename?: "WishlistItem";
  product: Product;
}

export interface Wishlist {
  id: string;
  userId: string;
  name: string;
  items: WishlistItem[];
  createdAt: string;
  updatedAt: string;
}

export interface WishlistsData {
  myWishlists: Wishlist[];
}
// hooks/useWishlist.ts
import {
  ADD_TO_WISHLIST,
  REMOVE_FROM_WISHLIST,
} from "@/client/wishlist/wishlist.mutation";
import { GET_MY_WISHLISTS } from "@/client/wishlist/wishlist.queries";
import { useApolloClient, useMutation, useQuery } from "@apollo/client";
import { useCallback, useMemo } from "react";

interface UseWishlistOptions {
  fetchPolicy?: "cache-first" | "cache-and-network" | "network-only";
  enablePolling?: boolean;
  pollingInterval?: number;
}

export const useWishlist = (options: UseWishlistOptions = {}) => {
  const client = useApolloClient();

  const { data, loading, error, refetch } = useQuery<WishlistsData>(
    GET_MY_WISHLISTS,
    {
      fetchPolicy: options.fetchPolicy || "cache-first",
      pollInterval: options.enablePolling
        ? options.pollingInterval || 30000
        : 0,
      notifyOnNetworkStatusChange: true,
    }
  );

  // Memoized computed values
  const wishlists = useMemo(() => data?.myWishlists || [], [data]);

  const defaultWishlist = useMemo(
    () => wishlists.find((wl) => wl.name === "My Wishlist") || wishlists[0],
    [wishlists]
  );

  const wishlistItems = useMemo(() => {
    const itemsMap = new Map<string, WishlistItem>();

    wishlists.forEach((wishlist) => {
      wishlist.items.forEach((item) => {
        if (!itemsMap.has(item.product.id)) {
          itemsMap.set(item.product.id, item);
        }
      });
    });

    return Array.from(itemsMap.values());
  }, [wishlists]);

  const productIdsInWishlist = useMemo(
    () => new Set(wishlistItems.map((item) => item.product.id)),
    [wishlistItems]
  );

  // Add to wishlist mutation
  const [addToWishlistMutation, { loading: addingToWishlist }] = useMutation(
    ADD_TO_WISHLIST,
    {
      onError: (error) => {
        console.error("Add to wishlist error:", error);
        // You could add a toast notification here
      },
    }
  );

  // Remove from wishlist mutation
  const [removeFromWishlistMutation, { loading: removingFromWishlist }] =
    useMutation(REMOVE_FROM_WISHLIST, {
      onError: (error) => {
        console.error("Remove from wishlist error:", error);
        // You could add a toast notification here
      },
    });

  // Optimized cache update helper
  const updateCacheAfterAdd = useCallback(
    (productId: string, wishlistItem: WishlistItem) => {
      const existingData = client.readQuery<WishlistsData>({
        query: GET_MY_WISHLISTS,
      });

      if (!existingData?.myWishlists) return;

      const targetWishlist = defaultWishlist || existingData.myWishlists[0];
      if (!targetWishlist) return;

      const updatedWishlists = existingData.myWishlists.map((wl) => {
        if (wl.id === targetWishlist.id) {
          return {
            ...wl,
            items: [...wl.items, wishlistItem],
          };
        }
        return wl;
      });

      client.writeQuery({
        query: GET_MY_WISHLISTS,
        data: {
          myWishlists: updatedWishlists,
        },
      });
    },
    [client, defaultWishlist]
  );

  // Optimized cache update helper for removal
  const updateCacheAfterRemove = useCallback(
    (productId: string) => {
      const existingData = client.readQuery<WishlistsData>({
        query: GET_MY_WISHLISTS,
      });

      if (!existingData?.myWishlists) return;

      const updatedWishlists = existingData.myWishlists.map((wishlist) => ({
        ...wishlist,
        items: wishlist.items.filter((item) => item.product.id !== productId),
      }));

      client.writeQuery({
        query: GET_MY_WISHLISTS,
        data: {
          myWishlists: updatedWishlists,
        },
      });
    },
    [client]
  );

  // Add to wishlist handler
  const handleAddToWishlist = useCallback(
    async (productId: string, product?: Partial<Product>) => {
      if (productIdsInWishlist.has(productId)) {
        console.warn(`Product ${productId} is already in wishlist`);
        return;
      }

      try {
        const optimisticWishlistItem: WishlistItem = {
          id: `temp-${Date.now()}`,
          wishlistId: defaultWishlist?.id || "",
          productId,
          __typename: "WishlistItem",
          product: {
            id: productId,
            name: product?.name || "",
            __typename: "Product",
            variants: product?.variants || [],
            images: product?.images || [],
          },
        };

        const { data } = await addToWishlistMutation({
          variables: { productId },
          optimisticResponse: {
            addToWishlist: optimisticWishlistItem,
          },
          update: (cache, { data: mutationData }) => {
            if (mutationData?.addToWishlist) {
              updateCacheAfterAdd(productId, mutationData.addToWishlist);
            }
          },
        });

        return data?.addToWishlist;
      } catch (error) {
        console.error("Failed to add to wishlist:", error);
        throw error;
      }
    },
    [
      productIdsInWishlist,
      defaultWishlist,
      addToWishlistMutation,
      updateCacheAfterAdd,
    ]
  );

  // Remove from wishlist handler
  const handleRemoveFromWishlist = useCallback(
    async (productId: string, wishlistId?: string) => {
      const targetWishlistId =
        wishlistId ||
        wishlistItems.find((item) => item.product.id === productId)?.wishlistId;

      if (!targetWishlistId) {
        console.error("Cannot find wishlist ID for product:", productId);
        return false;
      }

      try {
        const { data } = await removeFromWishlistMutation({
          variables: {
            productId,
            wishlistId: targetWishlistId,
          },
          optimisticResponse: {
            removeFromWishlist: true,
          },
          update: (cache, { data: mutationData }) => {
            if (mutationData?.removeFromWishlist) {
              updateCacheAfterRemove(productId);
            }
          },
        });

        return data?.removeFromWishlist;
      } catch (error) {
        console.error("Failed to remove from wishlist:", error);
        throw error;
      }
    },
    [wishlistItems, removeFromWishlistMutation, updateCacheAfterRemove]
  );

  // Check if product is in wishlist
  const isInWishlist = useCallback(
    (productId: string) => productIdsInWishlist.has(productId),
    [productIdsInWishlist]
  );

  // Get wishlist item by product ID
  const getWishlistItem = useCallback(
    (productId: string) =>
      wishlistItems.find((item) => item.product.id === productId),
    [wishlistItems]
  );

  return {
    // Data
    wishlists,
    wishlistItems,
    defaultWishlist,

    // State
    loading,
    error,
    addingToWishlist,
    removingFromWishlist,

    // Actions
    handleAddToWishlist,
    handleRemoveFromWishlist,
    refetch,

    // Utilities
    isInWishlist,
    getWishlistItem,
    productIdsInWishlist,
  };
};
