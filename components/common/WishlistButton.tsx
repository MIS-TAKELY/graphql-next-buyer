"use client";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Heart, Loader2 } from "lucide-react";
import { useCallback, useState } from "react";

interface WishlistButtonProps {
  added: boolean;
  onToggle: () => Promise<void> | void;
}

export function WishlistButton({ added, onToggle }: WishlistButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleClick = useCallback(async () => {
    setLoading(true);
    try {
      await onToggle();
    } finally {
      setLoading(false);
    }
  }, [onToggle]);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          size="lg"
          variant="outline"
          onClick={handleClick}
          disabled={loading}
          className={cn(
            "transition-all",
            added && "text-red-500 border-red-500 hover:bg-red-50"
          )}
          aria-label={added ? "Remove from wishlist" : "Add to wishlist"}
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Heart
              className={cn("w-5 h-5 transition-all", added && "fill-current")}
            />
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>{added ? "Remove from wishlist" : "Add to wishlist"}</p>
      </TooltipContent>
    </Tooltip>
  );
}
