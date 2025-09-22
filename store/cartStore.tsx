import { TGetCartId } from "@/hooks/cart/useCart";
import { create } from "zustand";
import { persist } from "zustand/middleware"; // Optional: For built-in localStorage persistence

// Your existing types (CartItem, etc.) go here...

type CartStore = {
  anonymousCart: TGetCartId[];
  setAnonymousCart: (cart: TGetCartId[]) => void;
  addInAnonymousCart: (productId: string) => void;
  removeFromAnonymousCart: (productId: string) => void;
  // Add logged-in cart state if needed
};

export const useCartStore = create<CartStore>()(
  persist( // Optional: Handles localStorage sync automatically
    (set, get) => ({
      anonymousCart: [], // Initial empty cart

      setAnonymousCart: (cart) => set({ anonymousCart: cart }),

      addInAnonymousCart: (productId) => {
        const currentCart = get().anonymousCart;
        const existingItem = currentCart.find(
          (item) => item?.variant?.product?.id === productId
        );

        if (existingItem) {
          return;
        }

        const newItem = { variant: { product: { id: productId } } };
        const updatedCart = [...currentCart, newItem];
        set({ anonymousCart: updatedCart });
      },

      removeFromAnonymousCart: (productId) => {
        const currentCart = get().anonymousCart;
        const updatedCart = currentCart.filter(
          (item) => item?.variant?.product?.id !== productId
        );
        set({ anonymousCart: updatedCart });
      },
    }),
    {
      name: "anonymous_cart", // Key for localStorage
    }
  )
);