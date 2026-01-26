import { create } from 'zustand';

interface AuthModalStore {
    isOpen: boolean;
    defaultStep: "SIGN_IN" | "SIGN_UP";
    openModal: (step?: "SIGN_IN" | "SIGN_UP") => void;
    closeModal: () => void;
}

export const useAuthModal = create<AuthModalStore>((set) => ({
    isOpen: false,
    defaultStep: "SIGN_IN",
    openModal: (step = "SIGN_IN") => set({ isOpen: true, defaultStep: step }),
    closeModal: () => set({ isOpen: false }),
}));
