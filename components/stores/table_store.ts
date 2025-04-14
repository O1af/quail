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

export type SpeedMode = "fast" | "medium" | "slow";

interface TableStore {
  // Query result related state
  data: SQLData[];
  columns: ColumnDef<SQLData, any>[];
  sorting: SortingState;
  columnVisibility: VisibilityState;
  rowSelection: Record<string, boolean>;
  isLoading: boolean;

  // Database structure related state
  databaseStructure: DatabaseStructure;

  // Speed mode state
  speedMode: SpeedMode;
  setSpeedMode: (mode: SpeedMode) => void;

  // Query result related actions
  setSorting: (sorting: SortingState | null) => void;
  setColumnVisibility: (visibility: VisibilityState) => void;
  setRowSelection: (selection: Record<string, boolean>) => void;
  setData: (data: SQLData[]) => void;
  setColumns: (columns: ColumnDef<SQLData, any>[]) => void;

  // Database structure related actions
  setDatabaseStructure: (structure: DatabaseStructure) => void;

  // Clear table data
  clearTableData: () => void;

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

  // Reset column visibility
  resetColumnVisibility: () => void;
}

export const useDatabaseStructure = () =>
  useTableStore((state) => state.databaseStructure);

export const useTableStore = create<TableStore>()(
  persist(
    (set) => ({
      // Query result related state
      data: [],
      columns: [],
      sorting: [],
      columnVisibility: {},
      rowSelection: {},
      isLoading: false,

      // Database structure state
      databaseStructure: { schemas: [] },

      // Speed mode state
      speedMode: "medium",
      setSpeedMode: (mode: SpeedMode) => set({ speedMode: mode }),

      // Query result related actions
      setSorting: (sorting: SortingState | null) =>
        set(() => ({
          sorting: sorting || [],
        })),
      setColumnVisibility: (columnVisibility) => set({ columnVisibility }),
      setRowSelection: (rowSelection) => set({ rowSelection }),
      setData: (data) =>
        set((state) => ({
          data,
          columnVisibility: {}, // Reset visibility when new data is loaded
        })),
      setColumns: (columns) => set({ columns }),

      // Database structure related actions
      setDatabaseStructure: (databaseStructure) => set({ databaseStructure }),

      // Clear table data
      clearTableData: () => set({ data: [], columns: [] }),

      // Pagination state
      pagination: {
        pageIndex: 0,
        pageSize: 10,
      },
      setPagination: (pagination) => set({ pagination }),

      // Global filter state
      globalFilter: "",
      setGlobalFilter: (filter) => set({ globalFilter: filter }),

      // Row size preference
      rowSizePreference: 25,
      setRowSizePreference: (size) =>
        set({
          rowSizePreference: size,
          pagination: { pageIndex: 0, pageSize: size },
        }),

      // Reset column visibility
      resetColumnVisibility: () => set({ columnVisibility: {} }),
    }),
    {
      name: "table-storage",
      storage: createJSONStorage(() => encryptedStorage),
      // Add state migration to handle undefined values
      partialize: (state) => ({
        ...state,
        rowSizePreference: state.rowSizePreference ?? 25,
        pagination: {
          pageIndex: 0,
          pageSize: state.rowSizePreference ?? 25,
        },
        globalFilter: state.globalFilter ?? "",
      }),
    }
  )
);

// Add selector functions
export const useTableData = () => useTableStore((state) => state.data);
export const useTableColumns = () => useTableStore((state) => state.columns);
export const useTableSorting = () => useTableStore((state) => state.sorting);
export const useTableVisibility = () =>
  useTableStore((state) => state.columnVisibility);
export const useTableSelection = () =>
  useTableStore((state) => state.rowSelection);

export const useSpeedMode = () => useTableStore((state) => state.speedMode);
