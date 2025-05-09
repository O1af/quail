"use server";

import { cookies } from "next/headers";
import { getUserDatabases } from "@/components/stores/db_mongo_store";

/**
 * Server-side function to get the current database connection
 * This is useful for components that need to access the database connection
 * without being able to use React hooks
 */
export async function getCurrentDatabaseConnection() {
  try {
    const dbState = await getUserDatabases();

    if (!dbState.currentDatabaseId) {
      throw new Error("No database selected");
    }

    const currentDb = dbState.databases.find(
      (db) => db.id === dbState.currentDatabaseId
    );

    if (!currentDb) {
      throw new Error("Selected database not found");
    }

    return {
      connectionString: currentDb.connectionString,
      type: currentDb.type,
    };
  } catch (error) {
    console.error("Error getting current database:", error);
    throw new Error("Failed to get database connection");
  }
}
