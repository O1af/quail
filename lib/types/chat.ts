import { Message } from "ai";

export interface ChatDocument {
  _id: string;
  messages: Message[];
  title: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export type ChatResponse = ChatDocument;
