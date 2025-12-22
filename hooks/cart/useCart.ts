"use client";

import { ADD_TO_CART, REMOVE_FROM_CART, UPDATE_CART_QUANTITY } from "@/client/cart/cart.mutations";
import { GET_CART_PRODUCT_IDS, GET_MY_CART_ITEMS } from "@/client/cart/cart.queries";
import { useCartStore } from "@/store/cartStore";
import { useMutation, useQuery } from "@apollo/client";
import { useSession } from "@/lib/auth-client";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";

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
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const [loading, setLoading] = useState<boolean>(false);

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

  // Import toast from sonner at the top (I will do this in a separate step or just assume it is done if I combine edits, but best to do distinct)
  // Actually I cannot add import at top and edit body in same replace_file_content call if they are far apart.
  // I will assume I add import separately.

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
      toast.error("Failed to add to cart. Please try again.");
    },
  });

  const addToCart = useCallback(
    async (variantId: string, productId: string, quantity: number = 1) => {
      setLoading(true);

      try {
        if (!userId) {
          addInAnonymousCart(productId, variantId);
          toast.success("Added to cart");
        } else {
          await addToCartMutation({
            variables: { variantId, productId, quantity },
            optimisticResponse: {
              addToCart: true,
            },
          });
          toast.success("Added to cart");
        }
      } catch (err) {
        // Error handled in onError
      } finally {
        setLoading(false);
      }
    },
    [addToCartMutation, userId, addInAnonymousCart]
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
    onError(error) {
      toast.error("Failed to remove from cart");
    }
  });

  const removeFromCart = useCallback(
    async (variantId: string, productId: string) => {
      setLoading(true);
      try {
        if (!userId) {
          removeFromAnonymousCart(productId);
          toast.success("Removed from cart");
        } else {
          await removeFromCartMutation({
            variables: { variantId, productId },
            optimisticResponse: {
              removeFromCart: true,
            },
          });
          toast.success("Removed from cart");
        }
      } catch (error) {
        // Handled in onError
      } finally {
        setLoading(false);
      }
    },
    [removeFromCartMutation, userId, removeFromAnonymousCart]
  );

  // Update quantity mutation
  const [updateQuantityMutation] = useMutation(UPDATE_CART_QUANTITY, {
    update(cache, { data }, { variables }) {
      if (!data?.updateCartQuantity) return;

      try {
        const { cartItemId, quantity } = variables || {};

        // Read current cart
        const currentData: any = cache.readQuery({ query: GET_MY_CART_ITEMS });

        if (currentData?.getMyCart) {
          const updatedCart = currentData.getMyCart.map((item: any) => {
            // Check against variant.id since that matches the cartItemId argument
            if (item.variant.id === cartItemId) {
              return { ...item, quantity };
            }
            return item;
          });

          cache.writeQuery({
            query: GET_MY_CART_ITEMS,
            data: {
              getMyCart: updatedCart,
            },
          });
        }
      } catch (error) {
        console.error("Optimistic update failed:", error);
      }
    },
    onError(error) {
      toast.error("Failed to update quantity");
    },
  });

  const updateQuantity = useCallback(
    async (cartItemId: string, quantity: number) => {
      if (quantity < 1) return;

      console.log("varient id-->", cartItemId)

      if (!userId) {
        // For anonymous cart, update quantity in store
        // (Assuming anonymous cart doesn't persist quantity to server)
        return;
      }

      try {
        await updateQuantityMutation({
          variables: { cartItemId, quantity },
          optimisticResponse: {
            updateCartQuantity: true,
          },
        });
      } catch (err) {
        console.error("Update quantity failed", err);
      }
    },
    [updateQuantityMutation, userId]
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
    updateQuantity,
    getButtonText,
    isLoading,
    anonymousCart,
  };
};
