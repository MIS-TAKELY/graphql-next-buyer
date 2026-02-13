"use client";

import { useAuthModal } from "@/store/authModalStore";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import UnifiedAuth from "./UnifiedAuth";
import { useState } from "react";

export default function GlobalAuthModal() {
    const { isOpen, closeModal, defaultStep } = useAuthModal();
    const [currentStep, setCurrentStep] = useState<string>("SIGN_IN");


    return (
        <Dialog open={isOpen} onOpenChange={(val) => {
            if (!val) {
                closeModal();
            }
        }}>
            <DialogContent
                className="sm:max-w-[1000px] p-0 border-none bg-transparent shadow-none"
                showCloseButton={false}
                onInteractOutside={(e) => {
                }}
                onEscapeKeyDown={(e) => {
                }}
            >
                <DialogTitle className="sr-only">Authentication</DialogTitle>
                <DialogDescription className="sr-only">
                    Sign in or create an account to access your Vanijay account
                </DialogDescription>
                <UnifiedAuth
                    isModal={true}
                    initialStep={defaultStep}
                    onClose={() => closeModal()}
                    onStepChange={(step) => setCurrentStep(step)}
                />
            </DialogContent>
        </Dialog>
    );
}
