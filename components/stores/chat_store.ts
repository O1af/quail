"use server";
import { Message } from "ai";
import { ObjectId } from "mongodb";
import { connectToMongo, getDatabase } from "./utils/mongo";
import { ChatDocument, ChatResponse } from "@/lib/types/chat";

const getCollection = () => getDatabase().collection<ChatDocument>("chats");

export async function createChat(userId: string): Promise<string> {
  try {
    await connectToMongo();
    const collection = getCollection();
    const result = await collection.insertOne({
      _id: new ObjectId().toString(),
      messages: [],
      userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return result.insertedId.toString();
  } catch (error) {
    console.error("Failed to create chat:", error);
    throw new Error("Failed to create chat");
  }
}

export async function loadChat(
  id: string,
  userId: string
): Promise<ChatResponse> {
  try {
    await connectToMongo();
    const collection = getCollection();
    const chat = await collection.findOne({ _id: id, userId });
    if (!chat) throw new Error("Chat not found");
    return chat;
  } catch (error) {
    console.error("Failed to load chat:", error);
    throw new Error("Failed to load chat");
  }
}

export async function saveChat(
  id: string,
  messages: Message[],
  userId: string
): Promise<void> {
  try {
    await connectToMongo();
    const collection = getCollection();
    const result = await collection.updateOne(
      { _id: id, userId },
      { $set: { messages, updatedAt: new Date() } }
    );
    if (result.matchedCount === 0) {
      throw new Error("Chat not found or unauthorized");
    }
  } catch (error) {
    console.error("Failed to save chat:", error);
    throw new Error("Failed to save chat");
  }
}

export async function listChats(
  userId: string,
  limit = 10
): Promise<ChatResponse[]> {
  try {
    await connectToMongo();
    return await getCollection()
      .find({ userId })
      .sort({ updatedAt: -1 })
      .limit(limit)
      .toArray();
  } catch (error) {
    console.error("Failed to list chats:", error);
    throw new Error("Failed to list chats");
  }
}
