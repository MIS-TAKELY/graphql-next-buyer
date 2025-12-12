import { create } from "zustand";

interface UIStore {
    isCartOpen: boolean;
    toggleCart: () => void;
    openCart: () => void;
    closeCart: () => void;

    isAuthModalOpen: boolean;
    openAuthModal: () => void;
    closeAuthModal: () => void;

    isLoading: boolean;
    setLoading: (loading: boolean) => void;
}

export const useUIStore = create<UIStore>((set) => ({
    isCartOpen: false,
    toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),
    openCart: () => set({ isCartOpen: true }),
    closeCart: () => set({ isCartOpen: false }),

    isAuthModalOpen: false,
    openAuthModal: () => set({ isAuthModalOpen: true }),
    closeAuthModal: () => set({ isAuthModalOpen: false }),

    isLoading: false,
    setLoading: (loading) => set({ isLoading: loading }),
}));
