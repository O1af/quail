"use server";

import { connectToMongo, getDatabase } from "./utils/mongo";
import {
  ConnectionsDocument,
  DatabaseConfig,
  DbState,
} from "@/lib/types/stores/dbConnections";
import { createClient } from "@/utils/supabase/server";
import {
  encrypt as baseEncrypt,
  decrypt as baseDecrypt,
} from "./utils/encrypted_store";
import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  createHash,
} from "crypto";

// Define the default connection string as a constant
const DEFAULT_CONNECTION_STRING =
  "postgresql://neondb_owner:npg_4LjT9XmwAqPH@ep-black-lab-a8zi1wg9-pooler.eastus2.azure.neon.tech/neondb?sslmode=require";

// Default database configuration
const defaultDatabase: DatabaseConfig = {
  id: 1,
  name: "Quail Test DB(READ ONLY)",
  type: "postgres",
  connectionString: DEFAULT_CONNECTION_STRING,
};

// Default state for new users
const getDefaultState = (): DbState => ({
  databases: [defaultDatabase],
  currentDatabaseId: 1,
  nextId: 2,
  isDatabaseChanged: false,
});

// Collection helper
const getConnectionsCollection = () =>
  getDatabase().collection<ConnectionsDocument>("connections");

/**
 * Verify user authentication and retrieve userId
 */
async function getUserId(): Promise<string> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.id) {
    throw new Error("User not authenticated");
  }

  return user.id;
}

/**
 * Generate a user-specific encryption key
 */
function getUserSpecificKey(userId: string): Buffer {
  const defaultKey =
    process.env.NEXT_PUBLIC_ENCRYPTION_KEY ||
    "default-key-32-chars-security123";
  return createHash("sha256")
    .update(userId + defaultKey)
    .digest();
}

/**
 * User-specific encryption function
 */
function userSpecificEncrypt(text: string, userId: string): string {
  try {
    const ALGORITHM = "aes-256-gcm";
    const userSpecificKey = getUserSpecificKey(userId);
    const iv = randomBytes(12);
    const cipher = createCipheriv(ALGORITHM, userSpecificKey, iv);
    const encrypted = Buffer.concat([
      cipher.update(text, "utf8"),
      cipher.final(),
    ]);
    const tag = cipher.getAuthTag();
    return Buffer.concat([iv, tag, encrypted]).toString("base64");
  } catch (error) {
    return baseEncrypt(text); // Fallback
  }
}

/**
 * User-specific decryption function
 */
function userSpecificDecrypt(data: string, userId: string): string {
  try {
    // Check if the data appears to be encrypted
    if (!data || data.length < 40 || !/^[A-Za-z0-9+/=]+$/.test(data)) {
      return data;
    }

    const ALGORITHM = "aes-256-gcm";
    const userSpecificKey = getUserSpecificKey(userId);
    const buf = Buffer.from(data, "base64");
    const iv = buf.subarray(0, 12);
    const tag = buf.subarray(12, 28);
    const encrypted = buf.subarray(28);

    const decipher = createDecipheriv(ALGORITHM, userSpecificKey, iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([
      decipher.update(encrypted),
      decipher.final(),
    ]).toString("utf8");
  } catch (error) {
    try {
      return baseDecrypt(data); // Try base decryption as fallback
    } catch {
      return data; // Return original if all decryption fails
    }
  }
}

/**
 * Process connection strings for encryption/decryption
 */
async function processConnectionStrings(
  databases: DatabaseConfig[],
  doEncrypt: boolean
): Promise<DatabaseConfig[]> {
  const userId = await getUserId();
  const processor = doEncrypt
    ? (str: string) => userSpecificEncrypt(str, userId)
    : (str: string) => userSpecificDecrypt(str, userId);

  return databases.map((db) => {
    // Skip encryption for the default connection string
    if (db.connectionString === DEFAULT_CONNECTION_STRING) {
      return db;
    }

    return {
      ...db,
      connectionString: db.connectionString
        ? processor(db.connectionString)
        : db.connectionString,
    };
  });
}

/**
 * Get user's database connections
 */
export async function getUserDatabases(): Promise<DbState> {
  try {
    const userId = await getUserId();
    await connectToMongo();
    const doc = await getConnectionsCollection().findOne({ _id: userId });

    if (!doc) {
      // Create default state for new users
      const defaultState = getDefaultState();

      // Save the default state with encrypted connection strings
      const encryptedDatabases = await processConnectionStrings(
        defaultState.databases,
        true
      );

      await getConnectionsCollection().insertOne({
        _id: userId,
        connections: JSON.stringify({
          ...defaultState,
          databases: encryptedDatabases,
        }),
        updatedAt: new Date(),
      });

      return defaultState;
    }

    const { databases, currentDatabaseId, nextId } = JSON.parse(
      doc.connections
    );

    // Decrypt connection strings
    const decryptedDatabases = databases
      ? await processConnectionStrings(databases, false)
      : [defaultDatabase];

    return {
      databases: decryptedDatabases,
      currentDatabaseId: currentDatabaseId || 1,
      nextId: nextId || 2,
      isDatabaseChanged: false,
    };
  } catch (error) {
    // Return default state if error occurs
    return getDefaultState();
  }
}

/**
 * Save the database state
 */
async function saveDbState(state: Partial<DbState>): Promise<void> {
  const userId = await getUserId();
  await connectToMongo();

  // Get existing state first
  const doc = await getConnectionsCollection().findOne({ _id: userId });

  // Set up current state (either existing or default)
  const currentState = doc ? await parseCurrentState(doc) : getDefaultState();

  // Merge with updates
  const newState = { ...currentState, ...state };

  // Encrypt connection strings before saving
  const stateToPersist = {
    ...newState,
    databases: await processConnectionStrings(newState.databases, true),
  };

  await getConnectionsCollection().updateOne(
    { _id: userId },
    {
      $set: {
        connections: JSON.stringify(stateToPersist),
        updatedAt: new Date(),
      },
    },
    { upsert: true }
  );
}

/**
 * Parse the current database state from MongoDB document
 */
async function parseCurrentState(doc: ConnectionsDocument): Promise<DbState> {
  const parsedState = JSON.parse(doc.connections);
  const decryptedDatabases = parsedState.databases
    ? await processConnectionStrings(parsedState.databases, false)
    : [defaultDatabase];

  return {
    ...parsedState,
    databases: decryptedDatabases,
  };
}

/**
 * Add a new database connection
 */
export async function addUserDatabase(
  config: Omit<DatabaseConfig, "id">
): Promise<{ id: number; nextId: number }> {
  try {
    const { databases, nextId } = await getUserDatabases();
    const newDb = { ...config, id: nextId };

    await saveDbState({
      databases: [...databases, newDb],
      nextId: nextId + 1,
    });

    return { id: nextId, nextId: nextId + 1 };
  } catch (error) {
    throw new Error("Failed to add database connection");
  }
}

/**
 * Update an existing database connection
 */
export async function updateUserDatabase(
  id: number,
  config: Partial<DatabaseConfig>
): Promise<void> {
  try {
    const { databases } = await getUserDatabases();
    const updatedDatabases = databases.map((db) =>
      db.id === id ? { ...db, ...config } : db
    );

    await saveDbState({ databases: updatedDatabases });
  } catch {
    throw new Error("Failed to update database connection");
  }
}

/**
 * Remove a database connection
 */
export async function removeUserDatabase(id: number): Promise<void> {
  try {
    const { databases, currentDatabaseId } = await getUserDatabases();

    await saveDbState({
      databases: databases.filter((db) => db.id !== id),
      currentDatabaseId: currentDatabaseId === id ? null : currentDatabaseId,
    });
  } catch {
    throw new Error("Failed to remove database connection");
  }
}

/**
 * Set the current database connection
 */
export async function setCurrentUserDatabase(id: number | null): Promise<void> {
  try {
    await saveDbState({ currentDatabaseId: id, isDatabaseChanged: true });
  } catch {
    throw new Error("Failed to set current database");
  }
}

/**
 * Removes all connections data for a user
 */
export async function removeUserConnections(): Promise<void> {
  try {
    const userId = await getUserId();
    await connectToMongo();
    await getConnectionsCollection().deleteOne({ _id: userId });
  } catch {
    throw new Error("Failed to remove connections");
  }
}
