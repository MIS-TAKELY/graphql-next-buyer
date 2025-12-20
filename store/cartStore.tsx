import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItemVariant {
  id?: string;
  product: {
    id: string;
  };
}

export interface CartItem {
  variant: CartItemVariant;
  quantity: number;
}

interface CartStore {
  anonymousCart: CartItem[];
  setAnonymousCart: (cart: CartItem[]) => void;
  addInAnonymousCart: (productId: string, variantId?: string) => void;
  removeFromAnonymousCart: (productId: string) => void;
  clearAnonymousCart: () => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      anonymousCart: [],

      setAnonymousCart: (cart) => set({ anonymousCart: cart }),

      addInAnonymousCart: (productId, variantId) => {
        const currentCart = get().anonymousCart;

        // Check if item already exists
        const existingItem = currentCart.find(
          (item) => item.variant.product.id === productId
        );

        if (existingItem) {
          // Ideally increase quantity here if we tracked it in anonymous cart more robustly
          return;
        }

        const newItem: CartItem = {
          variant: {
            id: variantId,
            product: { id: productId }
          },
          quantity: 1
        };

        set({ anonymousCart: [...currentCart, newItem] });
      },

      removeFromAnonymousCart: (productId) => {
        const currentCart = get().anonymousCart;
        const updatedCart = currentCart.filter(
          (item) => item.variant.product.id !== productId
        );
        set({ anonymousCart: updatedCart });
      },

      clearAnonymousCart: () => set({ anonymousCart: [] }),
    }),
    {
      name: "anonymous_cart",
    }
  )
);