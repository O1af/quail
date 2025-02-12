"use server";
import { Message } from "ai";
import { ObjectId } from "mongodb";
import { connectToMongo, getDatabase } from "./utils/mongo";
import { ChatDocument, ChatResponse, ChatListResponse } from "@/lib/types/chat";

const getCollection = () => getDatabase().collection<ChatDocument>("chats");

export async function loadChat(
  id: string,
  userId: string
): Promise<ChatResponse> {
  try {
    await connectToMongo();
    const collection = getCollection();
    const chat = await collection.findOne({ _id: id, userId });
    if (!chat) {
      // Return a default chat object if not found
      return {
        _id: id,
        messages: [],
        title: "New Chat",
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }
    return chat;
  } catch (error) {
    console.error("Failed to load chat:", error);
    throw new Error("Failed to load chat");
  }
}

export async function saveChat(
  id: string,
  messages: Message[],
  userId: string,
  title: string = "New Chat"
): Promise<void> {
  try {
    await connectToMongo();
    const collection = getCollection();
    const result = await collection.updateOne(
      { _id: id, userId },
      {
        $set: {
          messages,
          updatedAt: new Date(),
        },
        $setOnInsert: {
          title,
          createdAt: new Date(),
          userId,
        },
      },
      { upsert: true }
    );
  } catch (error) {
    console.error("Failed to save chat:", error);
    throw new Error("Failed to save chat");
  }
}

export async function listChats(userId: string): Promise<ChatListResponse[]> {
  try {
    await connectToMongo();
    return await getCollection()
      .find({ userId }, { projection: { title: 1, updatedAt: 1, _id: 1 } })
      .sort({ updatedAt: -1 })
      .toArray();
  } catch (error) {
    console.error("Failed to list chats:", error);
    throw new Error("Failed to list chats");
  }
}

export async function deleteChat(id: string, userId: string): Promise<void> {
  try {
    await connectToMongo();
    const collection = getCollection();
    const result = await collection.deleteOne({ _id: id, userId });
    if (result.deletedCount === 0) {
      throw new Error("Chat not found or unauthorized");
    }
  } catch (error) {
    console.error("Failed to delete chat:", error);
    throw new Error("Failed to delete chat");
  }
}
export async function renameChat(
  id: string,
  userId: string,
  newTitle: string
): Promise<void> {
  try {
    await connectToMongo();
    const collection = getCollection();
    const result = await collection.updateOne(
      { _id: id, userId },
      {
        $set: {
          title: newTitle,
          updatedAt: new Date(),
        },
      }
    );
  } catch (error) {
    console.error("Failed to rename chat:", error);
    throw new Error("Failed to rename chat");
  }
}

export async function generateId(): Promise<string> {
  return new ObjectId().toString();
}
