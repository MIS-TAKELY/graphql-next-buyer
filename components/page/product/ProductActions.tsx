"use client";

import { ShareButton } from "@/components/common/ShareButton";
import { MessageButton } from "@/components/common/MessageButton";
import { WishlistButton } from "@/components/common/WishlistButton";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useSession } from "@/lib/auth-client";

import { GitCompare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface ProductActionsProps {
  addedToWishlist: boolean;
  toggleWishlist: () => Promise<void> | void;
  itemName?: string;
  itemId?: string;
  onChatOpen?: () => void;
  isCompared?: boolean;
  onCompareToggle?: () => void;
}

function CompareButton({ isCompared, onToggle }: { isCompared?: boolean; onToggle?: () => void }) {
  if (!onToggle) return null;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          onClick={onToggle}
          className={`shrink-0 rounded-full h-11 w-11 ${isCompared
              ? "bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100 hover:text-blue-700"
              : "hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
        >
          <GitCompare className={`h-5 w-5 ${isCompared ? "fill-current" : ""}`} />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>{isCompared ? "Remove from Compare" : "Add to Compare"}</p>
      </TooltipContent>
    </Tooltip>
  );
}

export default function ProductActions({
  addedToWishlist,
  toggleWishlist,
  itemName,
  itemId,
  onChatOpen,
  isCompared,
  onCompareToggle,
}: ProductActionsProps) {
  const { data: session, isPending } = useSession();
  const userId = session?.user?.id;
  const isLoaded = !isPending;

  return (
    <TooltipProvider>
      <div className="flex gap-2">
        <WishlistButton added={addedToWishlist} onToggle={toggleWishlist} />
        <CompareButton isCompared={isCompared} onToggle={onCompareToggle} />
        <ShareButton itemName={itemName} />
        {onChatOpen && <MessageButton onClick={onChatOpen} />}
      </div>
    </TooltipProvider>
  );
}
