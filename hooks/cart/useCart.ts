"use client";

import { ADD_TO_CART, REMOVE_FROM_CART } from "@/client/cart/cart.mutations";
import { GET_CART_PRODUCT_IDS } from "@/client/cart/cart.queries";
import { useCartStore } from "@/store/cartStore";
import { useMutation, useQuery } from "@apollo/client";
import { useAuth } from "@clerk/nextjs";
import { useCallback, useMemo, useState } from "react";

const ANONYMOUS_CART_KEY = "anonymous_cart";
const CART_SYNC_KEY = "cart_sync_timestamp";

interface IGetCartIdResponse {
  getMyCart: [
    variant: {
      product: {
        id: string;
      };
    }
  ];
}

interface IGetCartId {
  variant: {
    product: {
      id: string;
    };
  };
}

export type TGetCartIdResponse = IGetCartIdResponse | null;
export type TGetCartId = IGetCartId | null;

export const useCart = () => {
  const { userId } = useAuth();
  const [loading, setLoading] = useState<boolean>(false);
  // const [anonymousCart, setAnonymousCart] = useState<TGetCartId[]>([]);

  const { anonymousCart, addInAnonymousCart, removeFromAnonymousCart } =
    useCartStore();

  const { data: myCartItemsIds, loading: cartLoading } = useQuery(
    GET_CART_PRODUCT_IDS,
    {
      skip: !userId,
      fetchPolicy: "cache-first",
      errorPolicy: "all",
    }
  );

  const myCartItems = useMemo(() => {
    if (userId) {
      // Logged-in: Use server data
      if (!myCartItemsIds?.getMyCart) return new Set<string>();
      return new Set(
        myCartItemsIds.getMyCart
          .map((item: any) => item?.variant?.product?.id)
          .filter(Boolean)
      );
    } else {
      return new Set([
        ...anonymousCart
          .map((item) => item?.variant?.product?.id)
          .filter(Boolean),
      ]);
    }
  }, [myCartItemsIds, userId, anonymousCart]);

  const [addToCartMutation] = useMutation(ADD_TO_CART, {
    update(cache, { data }, { variables }) {
      if (!data?.addToCart) return;

      try {
        const newCartItem = {
          quantity: variables!.quantity,
          variant: {
            id: variables!.variantId,
            product: {
              id: variables!.productId,
            },
          },
        };

        const existing: TGetCartIdResponse = cache.readQuery({
          query: GET_CART_PRODUCT_IDS,
        });
        const existingCart = existing?.getMyCart ?? [];

        const isItemInCart = existingCart.some(
          (item: any) => item?.variant?.id === variables!.variantId
        );

        if (!isItemInCart) {
          cache.writeQuery({
            query: GET_CART_PRODUCT_IDS,
            data: {
              getMyCart: [...existingCart, newCartItem],
            },
          });
        }
      } catch (error) {
        console.error("Error updating cache after addToCart:", error);
      }
    },
    onError(error) {
      console.error("Add to cart mutation failed:", error);
    },
  });
  const addToCart = useCallback(
    async (variantId: string, productId: string, quantity: number = 1) => {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
      }, 400);
      if (!userId) {
        addInAnonymousCart(productId);
      } else {
        await addToCartMutation({
          variables: { variantId, productId, quantity },
          optimisticResponse: {
            addToCart: true,
          },
        });
      }
    },
    [addToCartMutation, userId]
  );

  const [removeFromCartMutation] = useMutation(REMOVE_FROM_CART, {
    update(cache, { data }, { variables }) {
      if (!data?.removeFromCart) return;

      try {
        const existing: TGetCartIdResponse = cache.readQuery({
          query: GET_CART_PRODUCT_IDS,
        });

        const existingCart = existing?.getMyCart ?? [];

        const updatedCart = existingCart.filter(
          (item: any) => item?.variant?.product?.id !== variables?.productId
        );

        cache.writeQuery({
          query: GET_CART_PRODUCT_IDS,
          data: {
            getMyCart: updatedCart,
          },
        });
      } catch (error) {
        console.log("errror while removing from cart-->", error);
      }
    },
  });

  const removeFromCart = useCallback(
    async (variantId: string, productId: string) => {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
      }, 400);
      if (!userId) {
        removeFromAnonymousCart(productId);
      } else {
        await removeFromCartMutation({
          variables: { variantId, productId },
          optimisticResponse: {
            removeFromCart: true,
          },
        });
      }
    },
    [removeFromCartMutation, userId]
  );

  const checkIsInCart = (productId: string | undefined) => {
    return myCartItems?.has(productId || "") || false;
  };

  const isLoading = cartLoading || loading;

  const getButtonText = (productId: string | undefined) => {
    if (isLoading) return "Loading..";

    return checkIsInCart(productId) ? "In Cart" : "Add To Cart";
  };

  return {
    myCartItems,
    checkIsInCart,
    cartLoading,
    loading,
    addToCart,
    removeFromCart,
    getButtonText,
    isLoading,
    anonymousCart,
  };
};
