"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
// IMPORTANT: Import from types/chat, not the hook
import { LocalMessage } from "@/types/chat";
import React from "react";

interface MessageBubbleProps {
  message: LocalMessage;
  // Optional: If you pass isOwn from parent, use it.
  // If not, we calculate it below.
  isOwn?: boolean;
}

const MessageBubbleComponent = ({ message, isOwn }: MessageBubbleProps) => {
  // Logic: either use the prop passed from parent OR check if sender is 'user'
  const isUser = isOwn ?? message.sender === "user";

  const renderAttachment = (att: { id: string; url: string; type: string }) => {
    if (att.type === "IMAGE") {
      return (
        <img
          key={att.id}
          src={att.url}
          alt="attachment"
          className="w-48 h-48 rounded-lg object-cover border bg-black/10 cursor-pointer hover:opacity-95 transition-opacity"
          onClick={() => window.open(att.url, "_blank")}
        />
      );
    }
    if (att.type === "VIDEO") {
      return (
        <video
          key={att.id}
          src={att.url}
          controls
          className="w-48 h-48 rounded-lg object-cover border bg-black/10"
        />
      );
    }
    return (
      <a
        key={att.id}
        href={att.url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 p-2 bg-background/10 rounded border hover:bg-background/20 transition-colors"
      >
        <span className="text-xs underline truncate max-w-[150px]">
          {att.url.split("/").pop()}
        </span>
      </a>
    );
  };

  return (
    <div className={cn("flex gap-2", isUser ? "justify-end" : "justify-start")}>
      {!isUser && (
        <Avatar className="w-7 h-7 sm:w-8 sm:h-8 shrink-0">
          <AvatarFallback className="text-xs">S</AvatarFallback>
        </Avatar>
      )}

      <div
        className={cn(
          "max-w-[75%] sm:max-w-[70%] px-3 py-2 rounded-2xl break-words",
          isUser
            ? "bg-primary text-primary-foreground rounded-br-sm"
            : "bg-muted rounded-bl-sm"
        )}
      >
        <p className="text-sm whitespace-pre-wrap break-words">
          {message.text}
        </p>

        {message.attachments?.length ? (
          <div className="mt-2 flex flex-wrap gap-2">
            {message.attachments.map((att) => renderAttachment(att))}
          </div>
        ) : null}

        <div
          className={cn(
            "text-[10px] sm:text-xs mt-1 flex items-center gap-1",
            isUser ? "text-primary-foreground/70" : "text-muted-foreground"
          )}
        >
          <span>
            {new Date(message.timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
          {message.status === "sending" && (
            <span className="opacity-70"> • Sending...</span>
          )}
          {message.status === "failed" && (
            <span className="text-red-300"> • Failed</span>
          )}
        </div>
      </div>

      {isUser && (
        <Avatar className="w-7 h-7 sm:w-8 sm:h-8 shrink-0">
          <AvatarFallback className="text-xs">Me</AvatarFallback>
        </Avatar>
      )}
    </div>
  );
};

export const MessageBubble = React.memo(MessageBubbleComponent);
MessageBubble.displayName = "MessageBubble";
