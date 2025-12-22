"use client";

import { ADD_TO_CART, REMOVE_FROM_CART } from "@/client/cart/cart.mutations";
import { GET_CART_PRODUCT_IDS } from "@/client/cart/cart.queries";
import { useMutation, useQuery } from "@apollo/client";
import { useSession } from "@/lib/auth-client";
import { useCallback, useEffect, useMemo, useState } from "react";

const ANONYMOUS_CART_KEY = "anonymous_cart";
const CART_SYNC_KEY = "cart_sync_timestamp";

interface CartItem {
  productId: string;
  variantId: string;
  quantity: number;
}

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

type TGetCartIdResponse = IGetCartIdResponse | null;
type TGetCartId = IGetCartId | null;

export const useCartT = () => {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const [loading, setLoading] = useState<boolean>(false);
  const [anonymousCart, setAnonymousCart] = useState<TGetCartId[]>([]);

  const getAnonymousCartItems = useCallback(() => {
    try {
      const cartData = localStorage.getItem(ANONYMOUS_CART_KEY);
      return cartData ? JSON.parse(cartData) : [];
    } catch (error) {
      console.error("Error parsing anonymous cart from localStorage:", error);
      return [];
    }
  }, []);

  const addInAnonymousCart = (productId: string) => {
    // Get the latest cart items from localStorage
    const currentCartItems = getAnonymousCartItems();

    // Check if the product is already in the cart
    const existingItem = currentCartItems.find(
      (item: TGetCartId) => item?.variant?.product?.id === productId
    );

    let updatedCart;
    if (existingItem) {
      // Product already exists, don't add duplicate
      console.log("Product already in cart:", productId);
      updatedCart = currentCartItems;
    } else {
      // Add new item to the cart
      const newItemToAdd = {
        variant: { product: { id: productId } },
      };
      updatedCart = [...currentCartItems, newItemToAdd];
    }

    console.log("adding-->", ANONYMOUS_CART_KEY, JSON.stringify(updatedCart));
    localStorage.setItem(ANONYMOUS_CART_KEY, JSON.stringify(updatedCart));

    // Update state to trigger re-render
    setAnonymousCart(updatedCart);
  };

  const removeFromAnonymousCart = (productId: string) => {
    // Get the latest cart items from localStorage
    const currentCartItems = getAnonymousCartItems();

    const updatedCart = currentCartItems.filter(
      (item: TGetCartId) => item?.variant?.product?.id !== productId
    );

    console.log("removing-->", ANONYMOUS_CART_KEY, JSON.stringify(updatedCart));
    localStorage.setItem(ANONYMOUS_CART_KEY, JSON.stringify(updatedCart));

    // Update state to trigger re-render
    setAnonymousCart(updatedCart);
  };

  useEffect(() => {
    const cartItems = getAnonymousCartItems();
    setAnonymousCart(Array.isArray(cartItems) ? cartItems : []);
  }, []);

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
    }
    // Anonymous: Use localStorage data
    return new Set(
      anonymousCart
        ?.map((item) => item?.variant?.product?.id)
        .filter(Boolean) || []
    );
  }, [myCartItemsIds, userId, anonymousCart]);

  const [addToCartMutation] = useMutation(ADD_TO_CART, {
    update(cache, { data }) {
      if (!data?.addToCart) return;

      const newCartItem = data.addToCart;

      const existing: TGetCartIdResponse = cache.readQuery({
        query: GET_CART_PRODUCT_IDS,
      });
      const existingCart = existing?.getMyCart ?? [];

      cache.writeQuery({
        query: GET_CART_PRODUCT_IDS,
        data: {
          getMyCart: [...existingCart, newCartItem],
        },
      });
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
        const optimisticCartItem = {
          quantity,
          variant: {
            id: variantId,
            product: {
              id: productId,
            },
          },
        };
        await addToCartMutation({
          variables: { variantId, productId, quantity },
          optimisticResponse: {
            addToCart: optimisticCartItem,
          },
        });
      }
    },
    [addToCartMutation, userId]
  );

  const [removeFromCartMutation] = useMutation(REMOVE_FROM_CART, {
    update(cache, { data }, { variables }) {
      if (!data?.removeFromCart) return;

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

  return {
    myCartItemsT: myCartItems,
    checkIsInCart,
    cartLoading,
    loading,
    addToCartT: addToCart,
    removeFromCartT: removeFromCart,
  };
};
