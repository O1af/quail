"use client";

import { useEffect, useState } from "react";
import { create } from "zustand";
import {
  DatabaseConfig as DbConfig,
  DbState,
  DbType,
} from "@/lib/types/stores/dbConnections";
import { createClient } from "@/utils/supabase/client";
import {
  getUserDatabases,
  addUserDatabase,
  updateUserDatabase,
  removeUserDatabase,
  setCurrentUserDatabase,
} from "./db_mongo_store";

// Re-export DatabaseConfig for components to use
export type { DbConfig as DatabaseConfig };

// Use the exact same connection string as in db_mongo_store.ts
const DEFAULT_CONNECTION_STRING =
  "postgresql://neondb_owner:npg_4LjT9XmwAqPH@ep-black-lab-a8zi1wg9-pooler.eastus2.azure.neon.tech/neondb?sslmode=require";

// Default state when not authenticated or loading
const defaultState = {
  databases: [
    {
      id: 1,
      name: "Quail Test DB (READ ONLY)",
      type: "postgres" as DbType,
      connectionString: DEFAULT_CONNECTION_STRING,
    },
  ],
  currentDatabaseId: 1,
  nextId: 2,
  isDatabaseChanged: false,
};

type DbActions = {
  addDatabase: (config: Omit<DbConfig, "id">) => Promise<void>;
  removeDatabase: (id: number) => Promise<void>;
  setCurrentDatabase: (id: number | null) => Promise<void>;
  getCurrentDatabase: () => DbConfig | null;
  updateDatabase: (id: number, config: Partial<DbConfig>) => Promise<void>;
  setDatabaseChange: () => void;
  resetDatabaseChange: () => void;
  loadDatabases: () => Promise<void>;
  isLoading: boolean;
};

// Client-side store for synchronizing with server
export const useDbStore = create<DbState & DbActions>((set, get) => ({
  ...defaultState,
  isLoading: true,

  loadDatabases: async () => {
    set({ isLoading: true });
    try {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user?.id) {
        set({ isLoading: false });
        return;
      }

      const dbState = await getUserDatabases();
      set({ ...dbState, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
    }
  },

  addDatabase: async (config) => {
    try {
      const { id, nextId } = await addUserDatabase(config);
      set((state) => ({
        databases: [...state.databases, { ...config, id }],
        nextId,
      }));
    } catch (error) {
      throw error;
    }
  },

  removeDatabase: async (id) => {
    try {
      await removeUserDatabase(id);
      set((state) => {
        const updatedDatabases = state.databases.filter((db) => db.id !== id);

        // If we're removing the current database, select another one if available
        let newCurrentId = state.currentDatabaseId;
        if (state.currentDatabaseId === id) {
          // Find the first available database, or default to 1 (Quail Test DB)
          newCurrentId =
            updatedDatabases.length > 0 ? updatedDatabases[0].id : 1; // Default to the test DB if no other DBs exist

          // Also need to update this on the server side
          setCurrentUserDatabase(newCurrentId).catch(console.error);
        }

        return {
          databases: updatedDatabases,
          currentDatabaseId: newCurrentId,
          isDatabaseChanged:
            state.currentDatabaseId === id ? true : state.isDatabaseChanged,
        };
      });
    } catch (error) {
      throw error;
    }
  },

  setCurrentDatabase: async (id) => {
    try {
      await setCurrentUserDatabase(id);
      set({ currentDatabaseId: id, isDatabaseChanged: true });
    } catch (error) {
      throw error;
    }
  },

  getCurrentDatabase: () => {
    const { databases, currentDatabaseId } = get();
    return databases.find((db) => db.id === currentDatabaseId) ?? null;
  },

  updateDatabase: async (id, config) => {
    try {
      await updateUserDatabase(id, config);
      set((state) => ({
        databases: state.databases.map((db) =>
          db.id === id ? { ...db, ...config } : db
        ),
      }));
    } catch (error) {
      throw error;
    }
  },

  setDatabaseChange: () => set({ isDatabaseChanged: true }),
  resetDatabaseChange: () => set({ isDatabaseChanged: false }),
}));

// Add a safer version of the autoload hook that won't cause infinite loops
export function useDbStoreWithAutoLoad() {
  // We separate the loading state to avoid infinite effect triggers
  const [hasInitialized, setHasInitialized] = useState(false);
  const store = useDbStore();

  // Only run this once when the component mounts
  useEffect(() => {
    if (!hasInitialized) {
      store.loadDatabases().then(() => {
        setHasInitialized(true);
      });
    }
  }, [hasInitialized]);

  return store;
}
