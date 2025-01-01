import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { encryptedStorage } from "./encrypted_store";
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
}

export interface Table {
  name: string;
  type: string;
  columns: Column[];
}

export interface Schema {
  name: string;
  tables: Table[];
}

export interface DatabaseStructure {
  schemas: Schema[];
}

export interface DatabaseMetadata {
  table_schema: string;
  table_name: string;
  table_type: string;
  column_name: string;
  data_type: string;
}

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

  // Query result related actions
  setSorting: (sorting: SortingState) => void;
  setColumnVisibility: (visibility: VisibilityState) => void;
  setRowSelection: (selection: Record<string, boolean>) => void;
  setData: (data: SQLData[]) => void;
  setColumns: (columns: ColumnDef<SQLData, any>[]) => void;

  // Database structure related actions
  setDatabaseStructure: (structure: DatabaseStructure) => void;

  // Clear table data
  clearTableData: () => void;
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

      // Query result related actions
      setSorting: (sorting: SortingState) => set(() => ({ sorting })),
      setColumnVisibility: (columnVisibility) => set({ columnVisibility }),
      setRowSelection: (rowSelection) => set({ rowSelection }),
      setData: (data) => set({ data }),
      setColumns: (columns) => set({ columns }),

      // Database structure related actions
      setDatabaseStructure: (databaseStructure) => set({ databaseStructure }),

      // Clear table data
      clearTableData: () => set({ data: [], columns: [] }),
    }),
    {
      name: "table-storage",
      storage: createJSONStorage(() => encryptedStorage),
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
