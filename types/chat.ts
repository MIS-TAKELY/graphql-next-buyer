// types/chat.ts

export type MessageType = "TEXT" | "IMAGE" | "VIDEO" | "DOCUMENT";

export interface MessageAttachment {
  id: string;
  url: string;
  type: MessageType;
}

// Type alias for convenience
export type Attachment = MessageAttachment;

export interface LocalMessage {
  id: string;
  clientId?: string;
  text: string;
  // This was the cause of your error. We add "other" here.
  sender: "user" | "seller" | "other";
  senderId?: string;
  timestamp: Date;
  status?: "sending" | "sent" | "failed";
  attachments?: MessageAttachment[];
}