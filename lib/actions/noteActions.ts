"use server";

import { connectToMongo, getDatabase } from "@/components/stores/utils/mongo";
import { Collection, ObjectId } from "mongodb";

// Note interface
export interface Note {
  _id: string;
  userId: string;
  title: string;
  content: any; // Editor.js content
  createdAt: Date;
  updatedAt: Date;
}

// Helper function to get the notes collection
function getNotesCollection(): Collection<Note> {
  return getDatabase().collection<Note>("notes");
}

/**
 * Load all notes for a user
 */
export async function loadUserNotes(
  userId: string,
  options: {
    limit?: number;
    skip?: number;
    sort?: { [key: string]: 1 | -1 };
  } = {}
): Promise<Note[]> {
  try {
    await connectToMongo();
    const collection = getNotesCollection();

    // Set default options
    const skip = options.skip || 0;
    const sort = options.sort || { updatedAt: -1 }; // Default to most recent
    const limit = options.limit || 0;

    // Query notes for the user
    const notes = await collection
      .find({ userId })
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .toArray();

    return notes;
  } catch (error) {
    console.error("Failed to load notes:", error);
    throw new Error("Failed to load notes");
  }
}

/**
 * Load a single note
 */
export async function loadNote(
  noteId: string,
  userId: string
): Promise<Note | null> {
  try {
    await connectToMongo();
    const collection = getNotesCollection();

    const note = await collection.findOne({ _id: noteId, userId });
    return note;
  } catch (error) {
    console.error("Failed to load note:", error);
    throw new Error("Failed to load note");
  }
}

/**
 * Create a new note
 */
export async function createNote(
  note: Omit<Note, "_id" | "createdAt" | "updatedAt">
): Promise<Note> {
  try {
    await connectToMongo();
    const collection = getNotesCollection();

    const now = new Date();
    const newNote: Note = {
      _id: new ObjectId().toString(),
      ...note,
      createdAt: now,
      updatedAt: now,
    };

    await collection.insertOne(newNote);
    return newNote;
  } catch (error) {
    console.error("Failed to create note:", error);
    throw new Error("Failed to create note");
  }
}

/**
 * Update an existing note
 */
export async function updateNote(
  noteId: string,
  userId: string,
  updates: Partial<Omit<Note, "_id" | "userId" | "createdAt" | "updatedAt">>
): Promise<boolean> {
  try {
    await connectToMongo();
    const collection = getNotesCollection();

    const updateData = {
      ...updates,
      updatedAt: new Date(),
    };

    const result = await collection.updateOne(
      { _id: noteId, userId },
      { $set: updateData }
    );

    return result.modifiedCount > 0;
  } catch (error) {
    console.error("Failed to update note:", error);
    throw new Error("Failed to update note");
  }
}

/**
 * Delete a note
 */
export async function deleteNote(
  noteId: string,
  userId: string
): Promise<boolean> {
  try {
    await connectToMongo();
    const collection = getNotesCollection();

    const result = await collection.deleteOne({ _id: noteId, userId });
    return result.deletedCount === 1;
  } catch (error) {
    console.error("Failed to delete note:", error);
    throw new Error("Failed to delete note");
  }
}
