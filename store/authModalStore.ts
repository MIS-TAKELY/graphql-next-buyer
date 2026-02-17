import { create } from 'zustand';

interface AuthModalStore {
    isOpen: boolean;
    closable: boolean;
    defaultStep: "SIGN_IN" | "SIGN_UP_WHATSAPP_INPUT" | "SIGN_UP_WHATSAPP_OTP" | "SIGN_UP_DETAILS" | "SIGN_UP_EMAIL_OTP" | "FORGOT_PASSWORD_INPUT" | "FORGOT_PASSWORD_OTP" | "FORGOT_PASSWORD_RESET";
    openModal: (step?: "SIGN_IN" | "SIGN_UP_WHATSAPP_INPUT" | "SIGN_UP_WHATSAPP_OTP" | "SIGN_UP_DETAILS" | "SIGN_UP_EMAIL_OTP" | "FORGOT_PASSWORD_INPUT" | "FORGOT_PASSWORD_OTP" | "FORGOT_PASSWORD_RESET", options?: { closable?: boolean }) => void;
    closeModal: () => void;
}

export const useAuthModal = create<AuthModalStore>((set) => ({
    isOpen: false,
    closable: true,
    defaultStep: "SIGN_IN",
    openModal: (step = "SIGN_IN", options = { closable: true }) => set({
        isOpen: true,
        defaultStep: step,
        closable: options.closable ?? true
    }),
    closeModal: () => set({ isOpen: false, closable: true }),
}));
