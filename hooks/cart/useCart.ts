"use client";
import { ADD_TO_CART, REMOVE_FROM_CART } from "@/client/cart/cart.mutations";
import { GET_CART_PRODUCT_IDS } from "@/client/cart/cart.queries";
import { useMutation, useQuery } from "@apollo/client";
import { useCallback, useMemo, useState } from "react";

export const useCart = () => {
  // Local optimistic state - this updates instantly
  const [cartItems, setCartItems] = useState<Set<string>>(new Set());
  const [pendingOperations, setPendingOperations] = useState<Set<string>>(
    new Set()
  );

  const [itemLoading, setItemLoading] = useState(false);

  interface IVariables {
    productId: string;
    quantity?: number;
    variantId: string;
  }

  // Load cart items from server
  const { data: myCartItemsIds, loading: cartLoading } = useQuery(
    GET_CART_PRODUCT_IDS,
    {
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

  const [addToCartMutation] = useMutation<any, IVariables>(ADD_TO_CART);
  const [removeFromCartMutation] = useMutation<any, IVariables>(
    REMOVE_FROM_CART
  );

  // Server cart items (for fallback/sync)
  const serverCartItems = useMemo<Set<string>>(() => {
    if (!myCartItemsIds?.getMyCart) return new Set();
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
  }, [myCartItemsIds?.getMyCart]);

  const addToCart = useCallback(
    async (variantId: string, productId: string) => {
      setItemLoading(true);
      setTimeout(() => {
        setCartItems((prev) => new Set([...prev, productId]));
        setItemLoading(false);
      }, 400);
      setPendingOperations((prev) => new Set([...prev, productId]));

      addToCartMutation({
        variables: { variantId, quantity: 1, productId },
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
      }).catch(() => {});
    },
    [addToCartMutation]
  );

  const removeFromCart = useCallback(
    async (variantId: string, productId: string) => {
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

      // Fire mutation with inline handlers
      removeFromCartMutation({
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
      }).catch(() => {});
    },
    [removeFromCartMutation]
  );

  return {
    cartItems,
    serverCartItems,
    cartLoading,
    addToCart,
    removeFromCart,
    adding: pendingOperations.size > 0,
    removing: pendingOperations.size > 0,
    pendingOperations,
    itemLoading,
  };
};
