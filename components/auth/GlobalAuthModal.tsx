"use client";

import { useAuthModal } from "@/store/authModalStore";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import UnifiedAuth from "./UnifiedAuth";
import { useState } from "react";

export default function GlobalAuthModal() {
    const { isOpen, closeModal, defaultStep } = useAuthModal();
    const [currentStep, setCurrentStep] = useState<string>("SIGN_IN");

    const isClosable = !["PHONE_OTP", "PHONE_NUMBER"].includes(currentStep);

    return (
        <Dialog open={isOpen} onOpenChange={(val) => {
            if (isClosable || !val) {
                closeModal();
            }
        }}>
            <DialogContent
                className="sm:max-w-[1000px] p-0 border-none bg-transparent shadow-none"
                showCloseButton={false}
                onInteractOutside={(e) => {
                    if (!isClosable) {
                        e.preventDefault();
                    }
                }}
                onEscapeKeyDown={(e) => {
                    if (!isClosable) {
                        e.preventDefault();
                    }
                }}
            >
                <UnifiedAuth
                    isModal={true}
                    onClose={() => isClosable && closeModal()}
                    onStepChange={(step) => setCurrentStep(step)}
                />
            </DialogContent>
        </Dialog>
    );
}
