"use client";

import { ADD_TO_CART, REMOVE_FROM_CART } from "@/client/cart/cart.mutations";
import { GET_CART_PRODUCT_IDS } from "@/client/cart/cart.queries";
import { useMutation, useQuery } from "@apollo/client";
import { useAuth } from "@clerk/nextjs";
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

type TGetCartIdResponse = IGetCartIdResponse | null;

export const useCartT = () => {
  const { userId } = useAuth();

  // New: State for anonymous cart (array of CartItem)
  const [anonymousCart, setAnonymousCart] = useState<CartItem[]>([]);

  const [loading, setLoading] = useState<boolean>(false);


  const addAnanmusCart=(productId:string)=>{
    const allCarts=localStorage.ANONYMOUS_CART_KEY;
    const newAnocart={...allCarts,productId}
    localStorage.setItem(ANONYMOUS_CART_KEY,newAnocart)
  }

  // New: Load anonymous cart from localStorage on mount
  useEffect(() => {
    if (!userId) {
      try {
        setLoading(true);
        const storedCart = localStorage.getItem(ANONYMOUS_CART_KEY);
        if (storedCart) {
          setAnonymousCart(JSON.parse(storedCart));
        }
        setLoading(false);
      } catch (error) {
        console.error("Failed to load anonymous cart:", error);
        setAnonymousCart([]); // Reset on error
      }
    }
  }, [userId]);

  // New: Save anonymous cart to localStorage whenever it changes
  useEffect(() => {
    if (!userId && anonymousCart.length > 0) {
      //   console.log("saving in local storage -->", JSON.stringify(anonymousCart));
      localStorage.setItem(ANONYMOUS_CART_KEY, JSON.stringify(anonymousCart));
      // Optional: Update sync timestamp for later server sync
      localStorage.setItem(CART_SYNC_KEY, Date.now().toString());
    }
  }, [anonymousCart, userId]);

  // Get cart ids from server (for logged-in users)
  const { data: myCartItemsIds, loading: cartLoading } = useQuery(
    GET_CART_PRODUCT_IDS,
    {
      skip: !userId,
      fetchPolicy: "cache-first",
      errorPolicy: "all",
    }
  );

  // Structure cart ids in Set for fast lookups
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
      // Anonymous: Use localStorage data
      return new Set(anonymousCart.map((item) => item.productId));
    }
  }, [myCartItemsIds, anonymousCart, userId]);

  // Add to cart mutation (for logged-in users)
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
        // Anonymous: Update local state
        setAnonymousCart((prevCart) => {
          const existingItemIndex = prevCart.findIndex(
            (item) =>
              item.variantId === variantId && item.productId === productId
          );
          console.log("existingItemIndex-->", existingItemIndex);

          let updatedCart: CartItem[];
          if (existingItemIndex > -1) {
            console.log("exsits");
            updatedCart = [...prevCart];
          } else {
            console.log("doesnt exsits");
            // New item: Add to cart
            updatedCart = [...prevCart, { productId, variantId, quantity }];
          }
          console.log("updated cart-->", updatedCart);
          return updatedCart;
        });
        console.log("annamous", anonymousCart);
      } else {
        // Logged-in: Use mutation with optimistic response
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

  // Remove from cart mutation (for logged-in users)
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
        // Anonymous: Remove from local state
        console.log("removing ");
        console.log("variantId ", variantId);
        console.log("productId ", productId);

        setAnonymousCart((prevCart) =>
          prevCart.filter(
            (item) =>
              item.variantId !== variantId && item.productId !== productId
          )
        );
        console.log("anonymous", anonymousCart);
      } else {
        // Logged-in: Use mutation with optimistic response
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

  // New: Optional sync function (call this when user logs in, e.g., via useEffect on userId change)
  const syncAnonymousCartToServer = useCallback(async () => {
    if (userId && anonymousCart.length > 0) {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
      }, 400);
      for (const item of anonymousCart) {
        await addToCartMutation({
          variables: {
            variantId: item.variantId,
            productId: item.productId,
            quantity: item.quantity,
          },
        });
      }
      // Clear anonymous cart after sync
      setAnonymousCart([]);
      localStorage.removeItem(ANONYMOUS_CART_KEY);
      localStorage.removeItem(CART_SYNC_KEY);
    }
  }, [anonymousCart, addToCartMutation, userId]);

  // New: Trigger sync when user logs in (if anonymous cart exists)
  useEffect(() => {
    if (userId) {
      syncAnonymousCartToServer();
    }
  }, [userId, syncAnonymousCartToServer]);

  const checkIsInCart = (productId: string | undefined) => {
    if (myCartItems.has(productId || "")) return true;
    else return false;
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
// can you help me fix the error of not able to add to cart when user is not logged in