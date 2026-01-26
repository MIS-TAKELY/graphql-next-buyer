"use client";

import { useAuthModal } from "@/store/authModalStore";
import { ReactNode } from "react";

interface AuthDialogProps {
    children?: ReactNode;
    defaultStep?: "SIGN_IN" | "SIGN_UP";
}

export default function AuthDialog({ children, defaultStep = "SIGN_IN" }: AuthDialogProps) {
    const { openModal } = useAuthModal();

    return (
        <div onClick={() => openModal(defaultStep)} className="cursor-pointer contents">
            {children}
        </div>
    );
}
