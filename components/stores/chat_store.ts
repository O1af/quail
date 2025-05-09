"use server";
import { Message } from "ai";
import { ObjectId } from "mongodb";
import { connectToMongo, getDatabase } from "./utils/mongo";
import {
  ChatDocument,
  ChatResponse,
  ChatListResponse,
} from "@/lib/types/stores/chat";

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
      // If chat doesn't exist for this user, return a default structure
      // This prevents errors when trying to load a non-existent chat ID
      // and allows the frontend to potentially start a new chat with this ID.
      console.log(
        `Chat with id ${id} not found for user ${userId}. Returning default.`
      );
      return {
        _id: id, // Keep the requested ID
        messages: [],
        title: "New Chat", // Default title
        userId,
        createdAt: new Date(), // Set sensible defaults
        updatedAt: new Date(),
      };
    }
    // Ensure messages is always an array, even if stored as null/undefined
    chat.messages = chat.messages ?? [];
    return chat;
  } catch (error) {
    console.error(`Failed to load chat with id ${id}:`, error);
    throw new Error("Failed to load chat");
  }
}

export async function saveChat(
  id: string,
  messages: Message[],
  userId: string,
  title?: string // Title is now optional
): Promise<void> {
  try {
    await connectToMongo();
    const collection = getCollection();

    // Base fields for $set
    const setData: Partial<ChatDocument> = {
      messages,
      updatedAt: new Date(),
    };

    // Base fields for $setOnInsert
    const setOnInsertData: Partial<ChatDocument> = {
      createdAt: new Date(),
      userId,
    };

    if (title) {
      // If a title is provided, it should be set for both updates and inserts.
      setData.title = title;
    } else {
      // If no title is provided, set "New Chat" only on insert.
      // Existing documents will keep their current title during an update.
      setOnInsertData.title = "New Chat";
    }

    const result = await collection.updateOne(
      { _id: id, userId },
      {
        $set: setData,
        $setOnInsert: setOnInsertData,
      },
      { upsert: true }
    );

    if (result.upsertedCount > 0) {
      console.log(`Chat ${id} created for user ${userId}.`);
    } else if (result.modifiedCount > 0) {
      console.log(`Chat ${id} updated for user ${userId}.`);
    } else if (result.matchedCount > 0) {
      console.log(`Chat ${id} matched but not modified for user ${userId}.`);
    } else {
      console.warn(
        `Chat ${id} not found for update for user ${userId}. This might indicate an issue if upsert was expected.`
      );
    }
  } catch (error) {
    console.error("Failed to save chat:", error);
    throw new Error("Failed to save chat");
  }
}

export async function listChats(
  userId: string,
  limit?: number // Add optional limit parameter
): Promise<ChatListResponse[]> {
  try {
    await connectToMongo();
    const query = getCollection()
      .find({ userId }, { projection: { title: 1, updatedAt: 1, _id: 1 } })
      .sort({ updatedAt: -1 });

    if (limit) {
      query.limit(limit);
    }

    return await query.toArray();
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
      // It's possible the chat didn't exist, log but don't throw unless critical
      console.warn(
        `Attempted to delete chat ${id} for user ${userId}, but it was not found.`
      );
      // throw new Error("Chat not found or unauthorized");
    } else {
      console.log(`Chat ${id} deleted successfully for user ${userId}.`);
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
          // Ensure title is not empty, default to "New Chat" if it is
          title: newTitle.trim() || "New Chat",
          updatedAt: new Date(),
        },
      }
    );
    if (result.matchedCount === 0) {
      console.warn(
        `Attempted to rename chat ${id} for user ${userId}, but it was not found.`
      );
      // Optionally throw an error if the chat must exist
      // throw new Error("Chat not found or unauthorized");
    } else if (result.modifiedCount > 0) {
      console.log(`Chat ${id} renamed successfully for user ${userId}.`);
    } else {
      console.log(
        `Chat ${id} found but title was not modified for user ${userId}.`
      );
    }
  } catch (error) {
    console.error("Failed to rename chat:", error);
    throw new Error("Failed to rename chat");
  }
}

export async function generateId(): Promise<string> {
  // No need to connect to Mongo just for generating an ObjectId
  return new ObjectId().toString();
}
