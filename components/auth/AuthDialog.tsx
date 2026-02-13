"use client";

import { useAuthModal } from "@/store/authModalStore";
import { ReactNode } from "react";

interface AuthDialogProps {
    children?: ReactNode;
    defaultStep?: "SIGN_IN" | "SIGN_UP" | "SIGN_UP_WHATSAPP_INPUT";
}

export default function AuthDialog({ children, defaultStep = "SIGN_IN" }: AuthDialogProps) {
    const { openModal } = useAuthModal();

    const handleOpen = () => {
        if (defaultStep === "SIGN_UP") {
            openModal("SIGN_UP_WHATSAPP_INPUT");
        } else {
            openModal(defaultStep);
        }
    };

    return (
        <div onClick={handleOpen} className="cursor-pointer contents">
            {children}
        </div>
    );
}
