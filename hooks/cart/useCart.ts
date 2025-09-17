"use client";
import { ADD_TO_CART, REMOVE_FROM_CART } from "@/client/cart/cart.mutations";
import { GET_CART_PRODUCT_IDS } from "@/client/cart/cart.queries";
import { useMutation, useQuery } from "@apollo/client";
import { useAuth } from "@clerk/nextjs";
import { useCallback, useEffect, useMemo, useState } from "react";

// Local storage keys
const ANONYMOUS_CART_KEY = "anonymous_cart";
const CART_SYNC_KEY = "cart_sync_timestamp";

interface CartItem {
  productId: string;
  variantId: string;
  quantity: number;
  addedAt: number; // timestamp for ordering
}

interface AnonymousCart {
  items: CartItem[];
  lastUpdated: number;
}

export const useCart = () => {
  // Local optimistic state - this updates instantly
  const [cartItems, setCartItems] = useState<Set<string>>(new Set());
  const [pendingOperations, setPendingOperations] = useState<Set<string>>(
    new Set()
  );
  const [anonymousCartItems, setAnonymousCartItems] = useState<CartItem[]>([]);

  const { userId } = useAuth();
  const [itemLoading, setItemLoading] = useState(false);

  interface IVariables {
    productId: string;
    quantity?: number;
    variantId: string;
  }

  const getAnonymousCart = useCallback((): AnonymousCart => {
    if (typeof window === "undefined") return { items: [], lastUpdated: 0 };

    try {
      const stored = localStorage.getItem(ANONYMOUS_CART_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error("Error reading anonymous cart:", error);
    }
    return { items: [], lastUpdated: 0 };
  }, []);

  const saveAnonymousCart = useCallback((cart: AnonymousCart) => {
    if (typeof window === "undefined") return;

    try {
      localStorage.setItem(ANONYMOUS_CART_KEY, JSON.stringify(cart));
      localStorage.setItem(CART_SYNC_KEY, Date.now().toString());
    } catch (error) {
      console.error("Error saving anonymous cart:", error);
    }
  }, []);

  const clearAnonymousCart = useCallback(() => {
    if (typeof window === "undefined") return;

    try {
      localStorage.removeItem(ANONYMOUS_CART_KEY);
      localStorage.removeItem(CART_SYNC_KEY);
      setAnonymousCartItems([]);
    } catch (error) {
      console.error("Error clearing anonymous cart:", error);
    }
  }, []);

  useEffect(() => {
    const cart = getAnonymousCart();
    setAnonymousCartItems(cart.items);

    // Create a set of product IDs for quick lookup
    const productIds = new Set(cart.items.map((item) => item.productId));
    if (!userId) {
      setCartItems(productIds);
    }
  }, [getAnonymousCart, userId]);

  const { data: myCartItemsIds, loading: cartLoading } = useQuery(
    GET_CART_PRODUCT_IDS,
    {
      skip: !userId,
      fetchPolicy: "cache-first",
      errorPolicy: "all",
      onCompleted: (data) => {
        if (data?.getMyCart) {
          const serverIds = new Set<string>(
            data.getMyCart
              .map(
                (item: any) =>
                  item.variant?.product?.id ||
                  item.productId ||
                  item.product?.id
              )
              .filter(Boolean) as string[]
          );
          setCartItems(serverIds);
        }
      },
    }
  );

  const serverCartItems = useMemo<Set<string>>(() => {
    if (!userId || !myCartItemsIds?.getMyCart) return new Set();
    const ids = myCartItemsIds.getMyCart
      .map((item: any) => {
        if (item.variant?.product?.id) {
          return item.variant.product.id;
        } else if (item.productId) {
          return item.productId;
        } else if (item.product?.id) {
          return item.product.id;
        }
        return null;
      })
      .filter(Boolean);

    return new Set(ids);
  }, [userId, myCartItemsIds?.getMyCart]);

  const [addToCartMutation] = useMutation<any, IVariables>(ADD_TO_CART);
  const [removeFromCartMutation] = useMutation<any, IVariables>(
    REMOVE_FROM_CART
  );

  // Anonymous cart operations
  const addToAnonymousCart = useCallback(
    (variantId: string, productId: string, quantity: number = 1) => {
      const cart = getAnonymousCart();
      const existingItemIndex = cart.items.findIndex(
        (item) => item.productId === productId
      );

      if (existingItemIndex >= 0) {
        // Update existing item quantity
        cart.items[existingItemIndex].quantity += quantity;
      } else {
        // Add new item
        cart.items.push({
          productId,
          variantId,
          quantity,
          addedAt: Date.now(),
        });
      }

      cart.lastUpdated = Date.now();
      saveAnonymousCart(cart);
      setAnonymousCartItems(cart.items);

      // Update the cartItems set for UI consistency
      setCartItems((prev) => new Set([...prev, productId]));
    },
    [getAnonymousCart, saveAnonymousCart]
  );

  const removeFromAnonymousCart = useCallback(
    (productId: string) => {
      const cart = getAnonymousCart();
      cart.items = cart.items.filter((item) => item.productId !== productId);
      cart.lastUpdated = Date.now();

      saveAnonymousCart(cart);
      setAnonymousCartItems(cart.items);

      // Update the cartItems set for UI consistency
      setCartItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    },
    [getAnonymousCart, saveAnonymousCart]
  );

  // Function to sync anonymous cart to server when user logs in
  const syncAnonymousCartToServer = useCallback(async () => {
    if (!userId || anonymousCartItems.length === 0) return;

    try {
      // Add all anonymous cart items to server
      for (const item of anonymousCartItems) {
        await addToCartMutation({
          variables: {
            variantId: item.variantId,
            productId: item.productId,
            quantity: item.quantity,
          },
        });
      }

      // Clear anonymous cart after successful sync
      clearAnonymousCart();

      console.log("Anonymous cart synced to server successfully");
    } catch (error) {
      console.error("Failed to sync anonymous cart to server:", error);
    }
  }, [userId, anonymousCartItems, addToCartMutation, clearAnonymousCart]);

  // Auto-sync when user logs in
  useEffect(() => {
    if (userId && anonymousCartItems.length > 0) {
      syncAnonymousCartToServer();
    }
  }, [userId, syncAnonymousCartToServer, anonymousCartItems.length]);

  const addToCart = useCallback(
    async (variantId: string, productId: string, quantity: number = 1) => {
      // Handle anonymous users
      if (!userId) {
        setItemLoading(true);
        setTimeout(() => {
          addToAnonymousCart(variantId, productId, quantity);
          setItemLoading(false);
        }, 400);
        return;
      }

      // Handle logged-in users (existing logic)
      setItemLoading(true);
      setTimeout(() => {
        setCartItems((prev) => new Set([...prev, productId]));
        setItemLoading(false);
      }, 400);
      setPendingOperations((prev) => new Set([...prev, productId]));

      try {
        await addToCartMutation({
          variables: { variantId, quantity, productId },
          onCompleted: () => {
            setPendingOperations((prev) => {
              const newSet = new Set(prev);
              newSet.delete(productId);
              return newSet;
            });
          },
          onError: () => {
            console.error("Add to cart error");
            setCartItems((prev) => {
              const newSet = new Set(prev);
              newSet.delete(productId);
              return newSet;
            });
            setPendingOperations((prev) => {
              const newSet = new Set(prev);
              newSet.delete(productId);
              return newSet;
            });
          },
        });
      } catch (error) {
        console.error("Add to cart mutation failed", error);
      }
    },
    [addToCartMutation, userId, addToAnonymousCart]
  );

  const removeFromCart = useCallback(
    async (variantId: string, productId: string) => {
      // Handle anonymous users
      if (!userId) {
        setItemLoading(true);
        setTimeout(() => {
          removeFromAnonymousCart(productId);
          setItemLoading(false);
        }, 400);
        return;
      }

      // Handle logged-in users (existing logic)
      setItemLoading(true);
      setTimeout(() => {
        setCartItems((prev) => {
          const newSet = new Set(prev);
          newSet.delete(productId);
          setItemLoading(false);
          return newSet;
        });
      }, 400);
      setPendingOperations((prev) => new Set([...prev, productId]));

      try {
        await removeFromCartMutation({
          variables: { variantId, productId },
          onCompleted: () => {
            setPendingOperations((prev) => {
              const newSet = new Set(prev);
              newSet.delete(productId);
              return newSet;
            });
          },
          onError: () => {
            console.error("Remove from cart error");
            setCartItems((prev) => new Set([...prev, productId]));
            setPendingOperations((prev) => {
              const newSet = new Set(prev);
              newSet.delete(productId);
              return newSet;
            });
          },
        });
      } catch (error) {
        console.error("Remove from cart mutation failed", error);
      }
    },
    [removeFromCartMutation, userId, removeFromAnonymousCart]
  );

  // Get cart count for both logged-in and anonymous users
  const cartCount = useMemo(() => {
    if (userId) {
      return cartItems.size;
    } else {
      return anonymousCartItems.reduce(
        (total, item) => total + item.quantity,
        0
      );
    }
  }, [userId, cartItems.size, anonymousCartItems]);

  return {
    cartItems,
    serverCartItems,
    cartLoading: userId ? cartLoading : false,
    addToCart,
    removeFromCart,
    adding: pendingOperations.size > 0,
    removing: pendingOperations.size > 0,
    pendingOperations,
    itemLoading,
    // Additional returns for anonymous cart
    anonymousCartItems,
    cartCount,
    clearAnonymousCart,
    syncAnonymousCartToServer,
    isAnonymousUser: !userId,
  };
};
