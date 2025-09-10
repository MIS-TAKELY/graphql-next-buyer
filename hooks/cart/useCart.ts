"use client";
import { ADD_TO_CART, REMOVE_FROM_CART } from "@/client/cart/cart.mutations";
import { GET_CART_PRODUCT_IDS } from "@/client/cart/cart.queries";
import { useMutation, useQuery } from "@apollo/client";
import { useMemo } from "react";

export const useCart = () => {
  const {
    data: myCartItemsIds,
    loading: cartLoading,
    refetch,
    client, // Get Apollo client instance
  } = useQuery(GET_CART_PRODUCT_IDS, {
    fetchPolicy: "cache-and-network",
    errorPolicy: "all",
  });

  const [addToCartMutation, { loading: adding }] = useMutation(ADD_TO_CART, {
    // optimistic UI (pretend success instantly)
    optimisticResponse: (vars) => ({
      addToCart: {
        __typename: "CartItem",
        id: `temp-${vars.variantId}`, // temporary id
        variant: {
          __typename: "ProductVariant",
          id: vars.variantId,
          product: {
            __typename: "Product",
            id: vars.productId,
          },
        },
      },
    }),

    update: (cache, { data }) => {
      if (!data?.addToCart) return;
      cache.modify({
        fields: {
          getMyCart(existing = []) {
            return [...existing, data.addToCart]; // append new item
          },
        },
      });
    },

    onError: (error) => {
      console.error("Add to cart error:", error);
    },
  });

  const [removeFromCartMutation, { loading: removing }] = useMutation(
    REMOVE_FROM_CART,
    {
      optimisticResponse: (vars) => ({
        removeFromCart: {
          __typename: "CartItem",
          variant: { __typename: "ProductVariant", id: vars.variantId },
        },
      }),

      update: (cache, { data }) => {
        if (!data?.removeFromCart) return;
        cache.modify({
          fields: {
            getMyCart(existing = [], { readField }) {
              return existing.filter(
                (itemRef: any) =>
                  readField("id", itemRef.variant) !==
                  data.removeFromCart.variant.id
              );
            },
          },
        });
      },

      onError: (error) => {
        console.error("Remove from cart error:", error);
      },
    }
  );

  const cartProductIds = useMemo<Set<string>>(() => {
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

  const addToCart = async (variantId: string, productId: string) => {
    try {
      const result = await addToCartMutation({
        variables: { variantId, quantity: 1 },
        // Pass productId in context for optimistic updates
        context: { productId },
      });
      return result;
    } catch (error) {
      console.error("Failed to add to cart:", error);
      throw error;
    }
  };

  const removeFromCart = async (variantId: string, productId: string) => {
    try {
      const result = await removeFromCartMutation({
        variables: { variantId },
        context: { productId },
      });
      return result;
    } catch (error) {
      console.error("Failed to remove from cart:", error);
      throw error;
    }
  };

  return {
    cartItems: cartProductIds,
    cartLoading,
    addToCart,
    adding,
    removeFromCart,
    removing,
  };
};
