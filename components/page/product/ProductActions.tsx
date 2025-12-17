"use client";

import { ShareButton } from "@/components/common/ShareButton";
import { WishlistButton } from "@/components/common/WishlistButton";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@clerk/nextjs";

interface ProductActionsProps {
  addedToWishlist: boolean;
  toggleWishlist: () => Promise<void> | void;
  itemName?: string;
  itemId?: string;
}

export default function ProductActions({
  addedToWishlist,
  toggleWishlist,
  itemName,
  itemId,
}: ProductActionsProps) {
  const { userId, isLoaded } = useAuth();

  return (
    <TooltipProvider>
      <div className="flex gap-2">
        <WishlistButton added={addedToWishlist} onToggle={toggleWishlist} />
        <ShareButton itemName={itemName} />
      </div>
    </TooltipProvider>
  );
}
