export interface LocalMessage {
  id: string;
  text: string;
  sender: "user" | "seller";
  timestamp: Date;
  status?: "sending" | "sent" | "failed";
  attachments?: Array<{ id: string; url: string; type: "IMAGE" | "VIDEO" }>;
}
