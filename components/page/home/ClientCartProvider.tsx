'use client';

import { GET_CART_PRODUCT_IDS } from "@/client/cart/cart.queries";
import { useQuery } from "@apollo/client";
import { createContext, useContext, useMemo } from "react";

interface CartContextType {
  cartItems: Set<string>;
  loading: boolean;
}

const CartContext = createContext<CartContextType>({
  cartItems: new Set(),
  loading: false,
});

export const useCart = () => useContext(CartContext);

export default function ClientCartProvider({ children }: { children: React.ReactNode }) {
  const { data: myCartItems, loading: cartLoading } = useQuery(GET_CART_PRODUCT_IDS, {
    fetchPolicy: "cache-and-network",
    errorPolicy: "all",
    notifyOnNetworkStatusChange: false,
  });

  const cartProductIds = useMemo<Set<string>>(() => {
    if (!myCartItems?.getMyCart) return new Set<string>();
    return new Set<string>(
      myCartItems.getMyCart.map((item: any) => item.variant.product.id)
    );
  }, [myCartItems?.getMyCart]);

  const cartContextValue = useMemo(
    () => ({
      cartItems: cartProductIds,
      loading: cartLoading,
    }),
    [cartProductIds, cartLoading]
  );

  return <CartContext.Provider value={cartContextValue}>{children}</CartContext.Provider>;
}