import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { encryptedStorage } from "./utils/encrypted_store";
import {
  ColumnDef,
  SortingState,
  VisibilityState,
} from "@tanstack/react-table";

export interface SQLData {
  [key: string]: string | number | boolean | null;
}

export interface Column {
  name: string;
  dataType: string;
  ordinalPosition?: number;
  characterMaximumLength?: number;
  numericPrecision?: number;
  columnDefault?: string;
  isNullable?: string;
  isIdentity?: boolean;
  identityGeneration?: string;
  extra?: string;
  columnComment?: string;
  isPrimary?: boolean;
  isUnique?: boolean;
  isForeignKey?: boolean;
  referencedTable?: string;
  referencedColumn?: string;
}

export interface Index {
  name: string;
  columns: string[];
  isUnique: boolean;
  isPrimary: boolean;
}

export interface Table {
  name: string;
  type: string;
  comment?: string;
  columns: Column[];
  indexes: Index[];
}

export interface Schema {
  name: string;
  tables: Table[];
}

export interface DatabaseStructure {
  schemas: Schema[];
}

// DatabaseStructure is now managed by React Query hooks in lib/hooks/use-table-data.ts

export type SpeedMode = "fast" | "medium" | "slow";

// TableStore now only contains UI state, not server state
interface TableStore {
  // Table UI state
  sorting: SortingState;
  columnVisibility: VisibilityState;
  rowSelection: Record<string, boolean>;

  // Speed mode state
  speedMode: SpeedMode;
  setSpeedMode: (mode: SpeedMode) => void;

  // UI state actions
  setSorting: (sorting: SortingState | null) => void;
  setColumnVisibility: (visibility: VisibilityState) => void;
  setRowSelection: (selection: Record<string, boolean>) => void;
  resetColumnVisibility: () => void;

  // Pagination state
  pagination: {
    pageIndex: number;
    pageSize: number;
  };
  setPagination: (pagination: { pageIndex: number; pageSize: number }) => void;

  // Global filter state
  globalFilter: string;
  setGlobalFilter: (filter: string) => void;

  // Row size preference
  rowSizePreference: number;
  setRowSizePreference: (size: number) => void;
}

export const useTableStore = create<TableStore>()(
  persist(
    (set) => ({
      // UI state
      sorting: [],
      columnVisibility: {},
      rowSelection: {},

      // Speed mode state
      speedMode: "medium" as SpeedMode,
      setSpeedMode: (mode: SpeedMode) => set({ speedMode: mode }),

      // UI state actions
      setSorting: (sorting: SortingState | null) =>
        set(() => ({
          sorting: sorting || [],
        })),
      setColumnVisibility: (columnVisibility: VisibilityState) =>
        set({ columnVisibility }),
      setRowSelection: (rowSelection: Record<string, boolean>) =>
        set({ rowSelection }),
      resetColumnVisibility: () => set({ columnVisibility: {} }),

      // Pagination state
      pagination: {
        pageIndex: 0,
        pageSize: 10,
      },
      setPagination: (pagination: { pageIndex: number; pageSize: number }) =>
        set({ pagination }),

      // Global filter state
      globalFilter: "",
      setGlobalFilter: (filter: string) => set({ globalFilter: filter }),

      // Row size preference
      rowSizePreference: 25,
      setRowSizePreference: (size: number) =>
        set({
          rowSizePreference: size,
          pagination: { pageIndex: 0, pageSize: size },
        }),
    }),
    {
      name: "table-storage",
      storage: createJSONStorage(() => encryptedStorage),
      // Only store UI state preferences
      partialize: (state) => ({
        ...state,
        rowSizePreference: state.rowSizePreference ?? 25,
        pagination: {
          pageIndex: 0,
          pageSize: state.rowSizePreference ?? 25,
        },
        globalFilter: state.globalFilter ?? "",
        speedMode: state.speedMode ?? "medium",
      }),
    }
  )
);

// Add selector functions for UI state
export const useTableSorting = () => useTableStore((state) => state.sorting);
export const useTableVisibility = () =>
  useTableStore((state) => state.columnVisibility);
export const useTableSelection = () =>
  useTableStore((state) => state.rowSelection);
export const useTablePagination = () =>
  useTableStore((state) => state.pagination);
export const useTableGlobalFilter = () =>
  useTableStore((state) => state.globalFilter);
export const useTableRowSizePreference = () =>
  useTableStore((state) => state.rowSizePreference);
export const useSpeedMode = () => useTableStore((state) => state.speedMode);
