"use client";

import { ADD_TO_CART, REMOVE_FROM_CART, UPDATE_CART_QUANTITY } from "@/client/cart/cart.mutations";
import { GET_MY_CART_ITEMS } from "@/client/cart/cart.queries";
import { CartItem, useCartStore } from "@/store/cartStore";
import { useMutation, useQuery } from "@apollo/client";
import { useSession } from "@/lib/auth-client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

export const useCart = () => {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const [loading, setLoading] = useState<boolean>(false);

  const { items: cartItems, addItem, removeItem, updateQuantity: updateStoreQuantity, setCart, clearCart, selectedVariantIds, toggleSelection, setSelected, selectAll } =
    useCartStore();

  // Fetch full cart details from server for logged-in users
  const { data: serverCartData, loading: cartLoading, error: cartError, refetch } = useQuery(
    GET_MY_CART_ITEMS,
    {
      skip: !userId,
      fetchPolicy: "network-only", // Ensure we get fresh data on mount/login
      nextFetchPolicy: "cache-first",
    }
  );

  // Log fetch error
  useEffect(() => {
    if (cartError) {
      console.error("Error fetching cart:", cartError);
    }
  }, [cartError]);

  // Sync server data to store
  useEffect(() => {
    if (userId && serverCartData?.getMyCart) {
      const mappedItems: CartItem[] = serverCartData.getMyCart.map((item: any) => ({
        id: item.variant.product.id,
        name: item.variant.product.name,
        image: item.variant.product.images?.[0]?.url || "/placeholder.svg",
        price: item.variant.price,
        comparePrice: item.variant.mrp,
        sku: item.variant.sku,
        variantId: item.variant.id,
        quantity: item.quantity,
        stock: item.variant.stock, // maximizing utility
        slug: item.variant.product.slug,
        deliveryCharge: item.variant.product.deliveryCharge,
      }));
      setCart(mappedItems);
    }
    // If we logout, we should probably clear or handle anonymous. 
    // For now, let's just sync when we have data.
  }, [userId, serverCartData, setCart]);


  const [addToCartMutation] = useMutation(ADD_TO_CART, {
    onError(error) {
      console.error("Add to cart mutation failed:", error);
      toast.error("Failed to add to cart. Please try again.");
      // Rollback logic could be complex if we don't track previous state. 
      // For now, simple error toast. Ideally we refetch or remove the item.
      refetch();
    },
  });

  const [removeFromCartMutation] = useMutation(REMOVE_FROM_CART, {
    onError(error) {
      toast.error("Failed to remove from cart");
      refetch();
    }
  });

  const [updateQuantityMutation] = useMutation(UPDATE_CART_QUANTITY, {
    onError(error) {
      toast.error("Failed to update quantity");
      refetch();
    },
  });

  const addToCart = useCallback(
    async (
      variantId: string,
      productId: string,
      quantity: number = 1,
      productDetails?: { name: string; image: string; price: number; slug?: string }
    ) => {
      setLoading(true);

      // Construct optimistic item
      // We prioritize productDetails if passed, otherwise fall back to placeholders 
      // or what we might check from existing cache (not implemented here for simplicity)
      const optimisticItem: CartItem = {
        id: productId,
        variantId: variantId,
        quantity: quantity,
        name: productDetails?.name || "Product", // Fallback, updated on refetch
        image: productDetails?.image || "/placeholder.svg",
        price: productDetails?.price || 0,
        slug: productDetails?.slug,
      };

      try {
        // Optimistic Update
        addItem(optimisticItem);
        toast.success("Added to cart");

        if (userId) {
          await addToCartMutation({
            variables: { variantId, quantity },
          });
        }
      } catch (err) {
        // Error handled in onError of mutation (which triggers refetch)
        // Manual rollback if needed: removeItem(variantId)
        removeItem(variantId);
      } finally {
        setLoading(false);
      }
    },
    [addToCartMutation, userId, addItem, removeItem]
  );

  const removeFromCart = useCallback(
    async (variantId: string, productId: string) => {
      setLoading(true);

      // Optimistic
      const previousItems = cartItems;
      removeItem(variantId);
      toast.success("Removed from cart");

      try {
        if (userId) {
          await removeFromCartMutation({
            variables: { variantId },
          });
        }
      } catch (error) {
        setCart(previousItems); // Rollback
      } finally {
        setLoading(false);
      }
    },
    [removeFromCartMutation, userId, removeItem, cartItems, setCart]
  );

  const updateQuantity = useCallback(
    async (cartItemId: string, quantity: number) => { // cartItemId here is variantId based on usage
      if (quantity < 1) return;

      // Optimistic
      const previousItems = cartItems;
      updateStoreQuantity(cartItemId, quantity);

      if (!userId) {
        return;
      }

      try {
        await updateQuantityMutation({
          variables: { cartItemId, quantity },
        });
      } catch (err) {
        console.error("Update quantity failed", err);
        setCart(previousItems); // Rollback
      }
    },
    [updateQuantityMutation, userId, updateStoreQuantity, cartItems, setCart]
  );

  const checkIsInCart = (productId: string | undefined) => {
    return cartItems.some((item) => item.id === productId);
  };

  const isLoading = cartLoading || loading;

  const getButtonText = (productId: string | undefined) => {
    if (isLoading) return "Loading..";
    return checkIsInCart(productId) ? "In Cart" : "Add To Cart";
  };

  const selectedItems = useMemo(() => {
    return cartItems.filter(item => selectedVariantIds.includes(item.variantId));
  }, [cartItems, selectedVariantIds]);

  return {
    cartItems, // Return the full items
    myCartItems: new Set(cartItems.map(i => i.id)), // Keep backward compat for 'myCartItems.has' checks if any
    checkIsInCart,
    cartLoading,
    loading,
    addToCart,
    removeFromCart,
    updateQuantity,
    getButtonText,
    isLoading,
    selectedItems,
    selectedVariantIds,
    toggleSelection,
    setSelected,
    selectAll,
  };
};
