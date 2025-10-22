  "use client";

  import { ShareButton } from "@/components/common/ShareButton";
  import { WishlistButton } from "@/components/common/WishlistButton";
  import { TooltipProvider } from "@/components/ui/tooltip";
  import { useRealChat } from "@/hooks/chat/useRealChat";
  import { LocalMessage } from "@/types/chat";
  import { useAuth } from "@clerk/nextjs";
  import { useCallback, useMemo, useState } from "react";
  import { ChatTriggerButton } from "../chat/ChatTriggerButton";
import { ChatModal } from "../chat/ChatModal";

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

    const {
      conversationId,
      messages,
      initializeChat,
      handleSend,
      isLoading,
      error,
    } = useRealChat(itemId, userId || undefined);

    const messageCount = useMemo<number>(() => messages.length, [messages]);

    const handleOpenChat = useCallback(async () => {
      if (!isLoaded || !userId) return;
      setOpenChat(true);
      // Kick off initialization proactively for better perceived speed
      await initializeChat();
    }, [isLoaded, userId, initializeChat]);

    return (
      <TooltipProvider>
        <div className="flex gap-2">
          <WishlistButton added={addedToWishlist} onToggle={toggleWishlist} />
          <ShareButton itemName={itemName} />
          {isLoaded && userId && (
            <ChatTriggerButton
              onOpen={handleOpenChat}
              disabled={isLoading}
              messageCount={messageCount}
            />
          )}
        </div>
        {/* <ChatModal/> */}

        <ChatModal
          open={openChat}
          onOpenChange={setOpenChat}
          itemName={itemName}
          conversationId={conversationId}
          messages={messages as LocalMessage[]}
          isLoading={isLoading}
          error={error}
          initializeChat={initializeChat}
          onSend={handleSend}
        />
      </TooltipProvider>
    );
  }
