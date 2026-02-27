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
  deliveryCharge?: number;
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

  selectedVariantIds: string[];
  toggleSelection: (variantId: string) => void;
  setSelected: (ids: string[]) => void;
  selectAll: () => void;
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
            ...newItem, // Merge all new metadata (price, image, name, stock, etc.)
            quantity: existingItem.quantity + newItem.quantity,
          };
          set({ items: updatedItems });
        } else {
          set({
            items: [...currentItems, newItem],
            // Auto-select new items? Maybe yes.
            selectedVariantIds: [...get().selectedVariantIds, newItem.variantId]
          });
        }
      },

      removeItem: (variantId) => {
        const currentItems = get().items;
        set({
          items: currentItems.filter((item) => item.variantId !== variantId),
          selectedVariantIds: get().selectedVariantIds.filter(id => id !== variantId)
        });
      },

      updateQuantity: (variantId, quantity) => {
        const currentItems = get().items;
        const updatedItems = currentItems.map((item) =>
          item.variantId === variantId ? { ...item, quantity } : item
        );
        set({ items: updatedItems });
      },

      selectedVariantIds: [],
      toggleSelection: (variantId) => {
        const currentSelected = get().selectedVariantIds;
        if (currentSelected.includes(variantId)) {
          set({ selectedVariantIds: currentSelected.filter((id) => id !== variantId) });
        } else {
          set({ selectedVariantIds: [...currentSelected, variantId] });
        }
      },
      setSelected: (ids) => set({ selectedVariantIds: ids }),
      selectAll: () => {
        set({ selectedVariantIds: get().items.map((item) => item.variantId) });
      },

      clearCart: () => set({ items: [], anonymousCart: [], selectedVariantIds: [] }),
    }),
    {
      name: "cart-storage",
      partialize: (state) => ({ anonymousCart: state.anonymousCart, items: state.items, selectedVariantIds: state.selectedVariantIds }), // Persist both?
      // Ideally, if user is logged in, we trust server. If not, we trust local 'items' or 'anonymousCart'.
      // For simplicity, let's treat 'items' as the active UI state.
    }
  )
);