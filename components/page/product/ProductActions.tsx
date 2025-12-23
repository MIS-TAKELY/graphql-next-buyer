"use client";

import { ShareButton } from "@/components/common/ShareButton";
import { MessageButton } from "@/components/common/MessageButton";
import { WishlistButton } from "@/components/common/WishlistButton";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useSession } from "@/lib/auth-client";

interface ProductActionsProps {
  addedToWishlist: boolean;
  toggleWishlist: () => Promise<void> | void;
  itemName?: string;
  itemId?: string;
  onChatOpen?: () => void;
}

export default function ProductActions({
  addedToWishlist,
  toggleWishlist,
  itemName,
  itemId,
  onChatOpen,
}: ProductActionsProps) {
  const { data: session, isPending } = useSession();
  const userId = session?.user?.id;
  const isLoaded = !isPending;

  return (
    <TooltipProvider>
      <div className="flex gap-2">
        <WishlistButton added={addedToWishlist} onToggle={toggleWishlist} />
        <ShareButton itemName={itemName} />
        {onChatOpen && <MessageButton onClick={onChatOpen} />}
      </div>
    </TooltipProvider>
  );
}
