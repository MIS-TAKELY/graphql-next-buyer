"use client";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { MessageCircleMore } from "lucide-react";

interface ChatTriggerButtonProps {
  onOpen: () => void;
  disabled?: boolean;
  messageCount?: number;
}

export function ChatTriggerButton({
  onOpen,
  disabled,
  messageCount = 0,
}: ChatTriggerButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          size="lg"
          variant="outline"
          onClick={onOpen}
          disabled={disabled}
          className="transition-all"
          aria-label="Open chat with seller"
        >
          <MessageCircleMore className="w-5 h-5" />
          {messageCount > 0 && (
            <span className="ml-2 text-xs bg-primary text-primary-foreground rounded-full px-2 py-0.5">
              {messageCount}
            </span>
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>Chat with seller</p>
      </TooltipContent>
    </Tooltip>
  );
}
