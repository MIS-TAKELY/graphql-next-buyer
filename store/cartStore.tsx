import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  id: string; // Product ID
  name: string;
  image: string;
  price: number;
  comparePrice?: number;
  variantId: string;
  sku?: string;
  quantity: number;
  stock?: number;
  slug?: string;
  maxQuantity?: number;
}

interface CartStore {
  items: CartItem[];
  anonymousCart: CartItem[]; // Keep for persistence if not logged in

  // Actions
  setCart: (items: CartItem[]) => void;
  addItem: (item: CartItem) => void;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;

  // Anonymous specific (optional, could be merged logic)
  // We will try to unify, but keeping some backward compat logic or specific sync logic might be helpful
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      anonymousCart: [],

      setCart: (items) => set({ items }),

      addItem: (newItem) => {
        const currentItems = get().items;
        const existingItemIndex = currentItems.findIndex(
          (item) => item.variantId === newItem.variantId
        );

        if (existingItemIndex > -1) {
          const updatedItems = [...currentItems];
          const existingItem = updatedItems[existingItemIndex];
          updatedItems[existingItemIndex] = {
            ...existingItem,
            quantity: existingItem.quantity + newItem.quantity,
          };
          set({ items: updatedItems });
        } else {
          set({ items: [...currentItems, newItem] });
        }
      },

      removeItem: (variantId) => {
        const currentItems = get().items;
        set({
          items: currentItems.filter((item) => item.variantId !== variantId),
        });
      },

      updateQuantity: (variantId, quantity) => {
        const currentItems = get().items;
        const updatedItems = currentItems.map((item) =>
          item.variantId === variantId ? { ...item, quantity } : item
        );
        set({ items: updatedItems });
      },

      clearCart: () => set({ items: [], anonymousCart: [] }),
    }),
    {
      name: "cart-storage",
      partialize: (state) => ({ anonymousCart: state.anonymousCart, items: state.items }), // Persist both?
      // Ideally, if user is logged in, we trust server. If not, we trust local 'items' or 'anonymousCart'.
      // For simplicity, let's treat 'items' as the active UI state.
    }
  )
);