"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import {
  getUserDatabases,
  addUserDatabase,
  updateUserDatabase,
  removeUserDatabase,
  setCurrentUserDatabase,
} from "@/components/stores/db_mongo_store";
import {
  DatabaseConfig,
  DbState,
  DbType,
} from "@/lib/types/stores/dbConnections";
import { createClient } from "@/utils/supabase/client";

// Re-export DatabaseConfig for components to use
export type { DatabaseConfig };

// Define query keys for React Query
export const dbQueryKeys = {
  all: ["databases"] as const,
  list: () => [...dbQueryKeys.all, "list"] as const,
  current: () => [...dbQueryKeys.all, "current"] as const,
};

// Default connection string
const DEFAULT_CONNECTION_STRING =
  "postgresql://neondb_owner:npg_4LjT9XmwAqPH@ep-black-lab-a8zi1wg9-pooler.eastus2.azure.neon.tech/neondb?sslmode=require";

// Default state when not authenticated or loading
const defaultState: DbState = {
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

/**
 * Custom hook for database management using React Query
 */
export function useDatabase() {
  const queryClient = useQueryClient();
  const [isDatabaseChanged, setIsDatabaseChanged] = useState(false);

  // Fetch databases query
  const {
    data: dbState = defaultState,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: dbQueryKeys.list(),
    queryFn: async () => {
      try {
        const supabase = createClient();
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.user?.id) {
          return defaultState;
        }

        return await getUserDatabases();
      } catch (error) {
        console.error("Error loading databases:", error);
        return defaultState;
      }
    },
  });

  // Add database mutation
  const addDatabaseMutation = useMutation({
    mutationFn: async (config: Omit<DatabaseConfig, "id">) => {
      return await addUserDatabase(config);
    },
    onSuccess: (result, variables) => {
      // Update the query cache with the new database
      queryClient.setQueryData(
        dbQueryKeys.list(),
        (oldData: DbState | undefined) => {
          if (!oldData) return defaultState;

          return {
            ...oldData,
            databases: [...oldData.databases, { ...variables, id: result.id }],
            nextId: result.nextId,
          };
        }
      );
    },
  });

  // Remove database mutation
  const removeDatabaseMutation = useMutation({
    mutationFn: async (id: number) => {
      await removeUserDatabase(id);
      return id;
    },
    onSuccess: (id) => {
      queryClient.setQueryData(
        dbQueryKeys.list(),
        (oldData: DbState | undefined) => {
          if (!oldData) return defaultState;

          const updatedDatabases = oldData.databases.filter(
            (db) => db.id !== id
          );

          // If we're removing the current database, select another one if available
          let newCurrentId = oldData.currentDatabaseId;
          if (oldData.currentDatabaseId === id) {
            // Find the first available database, or default to 1 (Quail Test DB)
            newCurrentId =
              updatedDatabases.length > 0 ? updatedDatabases[0].id : 1;
            setIsDatabaseChanged(true);

            // Also update this on the server side
            setCurrentUserDatabase(newCurrentId).catch(console.error);
          }

          return {
            ...oldData,
            databases: updatedDatabases,
            currentDatabaseId: newCurrentId,
            isDatabaseChanged:
              oldData.currentDatabaseId === id
                ? true
                : oldData.isDatabaseChanged,
          };
        }
      );
    },
  });

  // Update database mutation
  const updateDatabaseMutation = useMutation({
    mutationFn: async ({
      id,
      config,
    }: {
      id: number;
      config: Partial<DatabaseConfig>;
    }) => {
      await updateUserDatabase(id, config);
      return { id, config };
    },
    onSuccess: ({ id, config }) => {
      queryClient.setQueryData(
        dbQueryKeys.list(),
        (oldData: DbState | undefined) => {
          if (!oldData) return defaultState;

          return {
            ...oldData,
            databases: oldData.databases.map((db) =>
              db.id === id ? { ...db, ...config } : db
            ),
          };
        }
      );
    },
  });

  // Set current database mutation
  const setCurrentDatabaseMutation = useMutation({
    mutationFn: async (id: number | null) => {
      await setCurrentUserDatabase(id);
      return id;
    },
    onSuccess: (id) => {
      setIsDatabaseChanged(true);

      queryClient.setQueryData(
        dbQueryKeys.list(),
        (oldData: DbState | undefined) => {
          if (!oldData) return defaultState;

          return {
            ...oldData,
            currentDatabaseId: id,
            isDatabaseChanged: true,
          };
        }
      );
    },
  });

  // Get current database
  const getCurrentDatabase = useCallback(() => {
    const databases = dbState.databases;
    const currentDatabaseId = dbState.currentDatabaseId;
    return databases.find((db) => db.id === currentDatabaseId) ?? null;
  }, [dbState.databases, dbState.currentDatabaseId]);

  return {
    // Database state
    databases: dbState.databases,
    currentDatabaseId: dbState.currentDatabaseId,
    nextId: dbState.nextId,
    isDatabaseChanged,
    isLoading,
    isError,

    // Actions
    loadDatabases: refetch,
    addDatabase: (config: Omit<DatabaseConfig, "id">) =>
      addDatabaseMutation.mutate(config),
    removeDatabase: (id: number) => removeDatabaseMutation.mutate(id),
    updateDatabase: (id: number, config: Partial<DatabaseConfig>) =>
      updateDatabaseMutation.mutate({ id, config }),
    setCurrentDatabase: (id: number | null) =>
      setCurrentDatabaseMutation.mutate(id),
    getCurrentDatabase,
    resetDatabaseChange: () => setIsDatabaseChanged(false),
  };
}
