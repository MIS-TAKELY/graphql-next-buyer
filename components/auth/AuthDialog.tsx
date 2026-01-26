"use client";

import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import UnifiedAuth from "./UnifiedAuth";
import { useState, ReactNode } from "react";

interface AuthDialogProps {
    children?: ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    defaultStep?: "SIGN_IN" | "SIGN_UP";
}

export default function AuthDialog({ children, open: controlledOpen, onOpenChange, defaultStep = "SIGN_IN" }: AuthDialogProps) {
    const [internalOpen, setInternalOpen] = useState(false);
    const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
    const setOpen = onOpenChange !== undefined ? onOpenChange : setInternalOpen;
    const [currentStep, setCurrentStep] = useState<string>("SIGN_IN");

    const isClosable = !["PHONE_OTP", "PHONE_NUMBER"].includes(currentStep);

    return (
        <Dialog open={open} onOpenChange={(val) => {
            if (isClosable || !val) {
                setOpen(val);
            }
        }}>
            {children && <DialogTrigger asChild>{children}</DialogTrigger>}
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
                    onClose={() => isClosable && setOpen(false)}
                    onStepChange={(step) => setCurrentStep(step)}
                />
            </DialogContent>
        </Dialog>
    );
}
