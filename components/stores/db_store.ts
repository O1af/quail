import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { encryptedStorage } from "./encrypted_store";

export type DbType = "postgres" | "mysql" | "sqlite";

export interface DatabaseConfig {
  id: number;
  name: string;
  type: DbType;
  connectionString: string;
  host?: string;
  port?: number;
  username?: string;
  password?: string;
}

type DbState = {
  databases: DatabaseConfig[];
  currentDatabaseId: number | null;
  nextId: number;
};

type DbActions = {
  addDatabase: (config: Omit<DatabaseConfig, "id">) => void;
  removeDatabase: (id: number) => void;
  setCurrentDatabase: (id: number | null) => void;
  getCurrentDatabase: () => DatabaseConfig | null;
  updateDatabase: (id: number, config: Partial<DatabaseConfig>) => void;
};

export const useDbStore = create<DbState & DbActions>()(
  persist(
    (set, get) => ({
      databases: [],
      currentDatabaseId: null,
      nextId: 1,

      addDatabase: (config) =>
        set((state) => ({
          databases: [...state.databases, { ...config, id: state.nextId }],
          nextId: state.nextId + 1,
        })),

      removeDatabase: (id) =>
        set((state) => ({
          databases: state.databases.filter((db) => db.id !== id),
          currentDatabaseId:
            state.currentDatabaseId === id ? null : state.currentDatabaseId,
        })),

      setCurrentDatabase: (id) => set({ currentDatabaseId: id }),

      getCurrentDatabase: () => {
        const { databases, currentDatabaseId } = get();
        return databases.find((db) => db.id === currentDatabaseId) ?? null;
      },

      updateDatabase: (id, config) =>
        set((state) => ({
          databases: state.databases.map((db) =>
            db.id === id ? { ...db, ...config } : db
          ),
        })),
    }),
    {
      name: "database-storage",
      storage: createJSONStorage(() => encryptedStorage),
    }
  )
);
