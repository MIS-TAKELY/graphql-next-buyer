"use client";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useShare } from "@/hooks/share/useShare";
import { Check, Share2 } from "lucide-react";
import React, { useMemo } from "react";

interface ShareButtonProps {
  itemName?: string;
}

export function ShareButton({ itemName }: ShareButtonProps) {
  const { share, copied } = useShare(itemName || "Check out this item");

  const content = useMemo(() => {
    if (copied) {
      return (
        <>
          <Check className="w-5 h-5 text-green-500" />
          <span className="ml-2 text-sm">Copied!</span>
        </>
      );
    }
    return <Share2 className="w-5 h-5" />;
  }, [copied]);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          size="lg"
          variant="outline"
          onClick={() => share(itemName)}
          className="transition-all"
          aria-label="Share this item"
        >
          {content}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>Share this item</p>
      </TooltipContent>
    </Tooltip>
  );
}