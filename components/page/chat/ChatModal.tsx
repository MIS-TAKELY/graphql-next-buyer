"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
// IMPORTANT: Import from types/chat
import { LocalMessage } from "@/types/chat";
import { File, Loader2, MessageCircle, Paperclip, Send, X } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { MessageBubble } from "./MessageBubble";

interface SelectedFile {
  file: File;
  preview?: string;
}

interface ChatModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemName?: string;
  messages: LocalMessage[];
  isLoading: boolean;
  error: string | null;
  onSend: (text: string, files?: File[]) => void;
  hasActiveConversation: boolean;
}

export function ChatModal({
  open,
  onOpenChange,
  itemName,
  messages,
  isLoading,
  error,
  onSend,
  hasActiveConversation,
}: ChatModalProps) {
  const [inputValue, setInputValue] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto scroll
  useEffect(() => {
    if (open && scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, open]);

  // Clean previews
  useEffect(() => {
    if (!open) {
      setSelectedFiles([]);
      setInputValue("");
    }
  }, [open]);




  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const newFiles = files.map((file) => ({
        file,
        preview: file.type.startsWith("image/")
          ? URL.createObjectURL(file)
          : undefined,
      }));
      setSelectedFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const handleSubmit = () => {
    if (!inputValue.trim() && !selectedFiles.length) return;
    onSend(
      inputValue,
      selectedFiles.map((f) => f.file)
    );
    setInputValue("");
    setSelectedFiles([]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 gap-0 sm:max-w-[440px] w-full h-[100dvh] sm:h-[600px] flex flex-col bg-background overflow-hidden border-none sm:border sm:rounded-xl">
        {/* Header */}
        <div className="px-4 py-3 border-b bg-muted/20 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <MessageCircle className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold">
                Seller Chat
              </DialogTitle>
              {itemName && (
                <DialogDescription className="text-xs truncate max-w-[200px]">
                  Re: {itemName}
                </DialogDescription>
              )}
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-hidden relative bg-slate-50 dark:bg-slate-950/50">
          <ScrollArea className="h-full w-full">
            <div className="p-4 flex flex-col gap-4 min-h-full justify-end">
              {isLoading && messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 gap-2 text-muted-foreground">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-sm">Connecting to seller...</p>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center gap-2 opacity-60">
                  <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                    <Send className="h-6 w-6 -ml-1" />
                  </div>
                  <p className="text-sm">Start the conversation!</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <MessageBubble
                    key={msg.clientId || msg.id}
                    message={msg}
                    // We pass isOwn here to handle the logic cleanly
                    isOwn={msg.sender === "user"}
                  />
                ))
              )}
              {error && (
                <div className="p-2 text-xs text-center text-red-500 bg-red-50 rounded">
                  {error}
                </div>
              )}
              <div ref={scrollRef} />
            </div>
          </ScrollArea>
        </div>

        {/* Input Area */}
        <div className="p-3 bg-background border-t shrink-0">
          {selectedFiles.length > 0 && (
            <div className="flex gap-2 mb-2 overflow-x-auto pb-2 scrollbar-none">
              {selectedFiles.map((f, i) => (
                <div
                  key={i}
                  className="relative h-16 w-16 shrink-0 rounded-lg border bg-muted flex items-center justify-center overflow-hidden group"
                >
                  {f.preview ? (
                    <img
                      src={f.preview}
                      className="h-full w-full object-cover"
                      alt="preview"
                    />
                  ) : (
                    <File className="h-6 w-6 text-muted-foreground" />
                  )}
                  <button
                    onClick={() =>
                      setSelectedFiles((prev) =>
                        prev.filter((_, idx) => idx !== i)
                      )
                    }
                    className="absolute top-0.5 right-0.5 bg-black/50 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2 items-end">
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0 text-muted-foreground"
              onClick={() => fileInputRef.current?.click()}
              disabled={!hasActiveConversation && isLoading}
            >
              <Paperclip className="h-5 w-5" />
            </Button>
            <input
              type="file"
              multiple
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="image/*,video/*,application/pdf"
            />

            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && !e.shiftKey && handleSubmit()
              }
              placeholder={
                isLoading && !hasActiveConversation
                  ? "Initializing..."
                  : "Type a message..."
              }
              disabled={!hasActiveConversation && isLoading}
              className="flex-1 bg-muted/50 focus-visible:ring-1 focus-visible:ring-primary/20 border-0"
            />

            <Button
              onClick={handleSubmit}
              disabled={
                (!inputValue && !selectedFiles.length) ||
                (!hasActiveConversation && isLoading)
              }
              size="icon"
              className={cn(
                "shrink-0 transition-all",
                inputValue || selectedFiles.length
                  ? "bg-primary"
                  : "bg-muted text-muted-foreground"
              )}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
