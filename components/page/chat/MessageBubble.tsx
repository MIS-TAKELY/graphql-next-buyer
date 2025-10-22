"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { LocalMessage } from "@/types/chat";
import React from "react";

interface MessageBubbleProps {
  message: LocalMessage;
}

const MessageBubbleComponent = ({ message }: MessageBubbleProps) => {
  const isUser = message.sender === "user";

  console.log("message--->",message)


  return (
    <div className={cn("flex gap-2", isUser ? "justify-end" : "justify-start")}>
      {!isUser && (
        <Avatar className="w-7 h-7 sm:w-8 sm:h-8 shrink-0">
          <AvatarFallback className="text-xs">Seller</AvatarFallback>
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
        <p className="text-sm whitespace-pre-wrap break-words">{message.text}</p>

        {message.attachments?.length ? (
          <div className="mt-2 flex flex-wrap gap-1">
            {message.attachments.map((att) => (
              <img
                key={att.id}
                src={att.url}
                alt=""
                className="w-16 h-16 rounded object-cover"
              />
            ))}
          </div>
        ) : null}

        <p
          className={cn(
            "text-[10px] sm:text-xs mt-1",
            isUser ? "text-primary-foreground/70" : "text-muted-foreground"
          )}
        >
          {message.timestamp.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
          {message.status === "sending" && " • Sending..."}
          {message.status === "failed" && " • Failed"}
        </p>
      </div>

      {isUser && (
        <Avatar className="w-7 h-7 sm:w-8 sm:h-8 shrink-0">
          <AvatarFallback className="text-xs">You</AvatarFallback>
        </Avatar>
      )}
    </div>
  );
};

export const MessageBubble = React.memo(MessageBubbleComponent);
MessageBubble.displayName = "MessageBubble";