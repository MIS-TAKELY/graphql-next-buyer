"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { LocalMessage } from "@/types/chat";
import {
  File,
  FileText,
  MessageCircleMore,
  Paperclip,
  Send,
  X,
} from "lucide-react";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { MessageBubble } from "./MessageBubble";

interface SelectedFile {
  file: File;
  preview?: string;
  name: string;
}

interface ChatDialogProps {
  open: boolean;
  itemId?: string;
  userId?: string;
  onOpenChange: (open: boolean) => void;
  onClose?: () => void;
  itemName?: string;
  conversationId?: string | null;
  messages: LocalMessage[];
  isLoading: boolean;
  error?: string | null;
  initializeChat: () => Promise<void>;
  onSend: (text: string, files?: File[]) => void; // Updated to accept files
}

export function ChatModal({
  open,
  onOpenChange,
  itemName,
  itemId,
  userId,
  onClose,
  conversationId,
  messages,
  isLoading,
  error,
  initializeChat,
  onSend,
}: ChatDialogProps) {
  const [inputValue, setInputValue] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Cleanup file previews on unmount
  useEffect(() => {
    return () => {
      selectedFiles.forEach(({ preview }) => {
        if (preview) URL.revokeObjectURL(preview);
      });
    };
  }, [selectedFiles]);

  // Initialize chat if dialog opens and chat isn't initialized yet
  useEffect(() => {
    if (open && !conversationId && !isLoading) {
      void initializeChat();
    }
  }, [open, conversationId, isLoading, initializeChat]);

  // Auto-focus input when opened
  useEffect(() => {
    if (open && inputRef.current) {
      const t = setTimeout(() => inputRef.current?.focus(), 100);
      return () => clearTimeout(t);
    }
  }, [open]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (!open) return;
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [open, messages.length]);

  const handleAttachClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        const newFiles = Array.from(e.target.files);
        const newFilesWithPreview: SelectedFile[] = newFiles.map((file) => {
          let preview: string | undefined = undefined;
          if (
            file.type.startsWith("image/") ||
            file.type.startsWith("video/")
          ) {
            preview = URL.createObjectURL(file);
          }
          return { file, preview, name: file.name };
        });
        setSelectedFiles((prev) => [...prev, ...newFilesWithPreview]);
        e.target.value = "";
      }
    },
    []
  );

  const handleRemoveFile = useCallback(
    (index: number) => {
      const fileToRemove = selectedFiles[index];
      if (fileToRemove.preview) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    },
    [selectedFiles]
  );

  const placeholder = useMemo(() => {
    if (isLoading) return "Loading...";
    if (conversationId) return "Type your message...";
    return "Click to start chat";
  }, [isLoading, conversationId]);

  const disabled = isLoading || !conversationId;

  const handleSend = useCallback(() => {
    const text = inputValue.trim();
    if (!text && selectedFiles.length === 0) return;

    const filesToSend = selectedFiles.map((sf) => sf.file);
    onSend(text, filesToSend);

    // Cleanup
    selectedFiles.forEach(({ preview }) => {
      if (preview) URL.revokeObjectURL(preview);
    });
    setInputValue("");
    setSelectedFiles([]);
  }, [inputValue, selectedFiles, onSend]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  const getFileIcon = (sf: SelectedFile) => {
    if (sf.preview) return null;
    const nameLower = sf.name.toLowerCase();
    if (
      nameLower.endsWith(".pdf") ||
      nameLower.endsWith(".doc") ||
      nameLower.endsWith(".docx")
    ) {
      return <FileText className="w-6 h-6 text-muted-foreground" />;
    }
    return <File className="w-6 h-6 text-muted-foreground" />;
  };

  const hasContent = inputValue.trim() || selectedFiles.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] w-[95vw] h-[85vh] sm:h-[600px] max-h-[600px] p-0 flex flex-col overflow-hidden">
        <DialogHeader className="px-4 sm:px-6 py-3 sm:py-4 border-b shrink-0">
          <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
            <MessageCircleMore className="w-4 h-4 sm:w-5 sm:h-5" />
            Chat with Seller
          </DialogTitle>
          {itemName && (
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 truncate">
              Regarding: {itemName}
            </p>
          )}
          {error && <p className="text-xs text-destructive mt-1">{error}</p>}
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full px-4 sm:px-6">
            <div className="py-4 space-y-3 sm:space-y-4">
              {isLoading ? (
                <p className="text-center text-muted-foreground">
                  Initializing chat...
                </p>
              ) : messages.length === 0 ? (
                <p className="text-center text-muted-foreground italic">
                  No messages yet. Start the conversation!
                </p>
              ) : (
                messages.map((m) => <MessageBubble key={m.id} message={m} />)
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        </div>

        <div className="border-t px-4 sm:px-6 py-3 sm:py-4 shrink-0 bg-background">
          {/* File previews */}
          {selectedFiles.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 mb-2">
              {selectedFiles.map((sf, index) => (
                <div
                  key={index}
                  className="flex items-center gap-1 bg-muted rounded-md px-2 py-1"
                >
                  {sf.preview ? (
                    sf.file.type.startsWith("image/") ? (
                      <img
                        src={sf.preview}
                        alt={sf.name}
                        className="w-6 h-6 object-cover rounded"
                      />
                    ) : sf.file.type.startsWith("video/") ? (
                      <video
                        src={sf.preview}
                        className="w-6 h-6 object-cover rounded"
                      />
                    ) : (
                      getFileIcon(sf)
                    )
                  ) : (
                    getFileIcon(sf)
                  )}
                  <span className="text-xs truncate max-w-20">{sf.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveFile(index)}
                    className="h-4 w-4 p-0"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Input area */}
          <div className="flex gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    onClick={handleAttachClick}
                    disabled={disabled}
                    variant="ghost"
                    size="icon"
                    className="shrink-0"
                    aria-label="Attach file"
                  >
                    <Paperclip className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {disabled ? "Initialize chat first" : "Attach file"}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled}
              className="flex-1 text-sm"
              maxLength={500}
            />

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileChange}
              multiple
              accept="image/*,video/*,application/pdf,.doc,.docx"
              className="hidden"
            />

            <Button
              onClick={handleSend}
              disabled={!hasContent || disabled}
              size="icon"
              className="shrink-0"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>

          {inputValue.length > 400 && (
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
              {500 - inputValue.length} characters remaining
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
