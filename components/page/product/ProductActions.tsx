"use client";

import { ShareButton } from "@/components/common/ShareButton";
import { WishlistButton } from "@/components/common/WishlistButton";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useRealChat } from "@/hooks/chat/useRealChat";
import { useAuth } from "@clerk/nextjs";
import { useCallback, useState } from "react";
import { ChatModal } from "../chat/ChatModal";
import { ChatTriggerButton } from "../chat/ChatTriggerButton"; // Assuming you have this

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
  const [openChat, setOpenChat] = useState(false);

  // Hook logic
  const {
    conversationId,
    messages,
    initializeChat,
    handleSend,
    isLoading,
    error,
  } = useRealChat(itemId, userId || undefined);

  const handleOpenChat = useCallback(() => {
    if (!isLoaded || !userId) {
      // Redirect to login or show toast
      return;
    }
    setOpenChat(true);
    // Explicitly start initialization when user wants to chat
    // This prevents loops associated with useEffects inside the modal
    initializeChat();
  }, [isLoaded, userId, initializeChat]);

  return (
    <TooltipProvider>
      <div className="flex gap-2">
        <WishlistButton added={addedToWishlist} onToggle={toggleWishlist} />
        <ShareButton itemName={itemName} />

        {isLoaded && userId && (
          <ChatTriggerButton
            onOpen={handleOpenChat}
            disabled={isLoading && !conversationId} // Disable only if loading AND no chat exists
            messageCount={messages.length}
          />
        )}
      </div>

      <ChatModal
        open={openChat}
        onOpenChange={setOpenChat}
        itemName={itemName}
        messages={messages}
        isLoading={isLoading}
        error={error}
        onSend={handleSend}
        // We pass conversationId to know if the input should be enabled
        hasActiveConversation={!!conversationId}
      />
    </TooltipProvider>
  );
}
