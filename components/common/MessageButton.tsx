"use client";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { MessageSquareText } from "lucide-react";
import React from "react";

interface MessageButtonProps {
    onClick: () => void;
    disabled?: boolean;
}

export function MessageButton({ onClick, disabled }: MessageButtonProps) {
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Button
                    size="lg"
                    variant="outline"
                    onClick={onClick}
                    className="transition-all"
                    aria-label="Message seller"
                    disabled={disabled}
                >
                    <MessageSquareText className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </Button>
            </TooltipTrigger>
            <TooltipContent>
                <p>Message seller</p>
            </TooltipContent>
        </Tooltip>
    );
}
