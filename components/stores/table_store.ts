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

interface TableStore {
  data: SQLData[];
  columns: ColumnDef<SQLData, any>[];
  sorting: SortingState;
  columnVisibility: VisibilityState;
  rowSelection: Record<string, boolean>;
  setSorting: (sorting: SortingState) => void;
  setColumnVisibility: (visibility: VisibilityState) => void;
  setRowSelection: (selection: Record<string, boolean>) => void;
  setData: (data: SQLData[]) => void;
  setColumns: (columns: ColumnDef<SQLData, any>[]) => void;
}

export const useTableStore = create<TableStore>()(
  persist(
    (set) => ({
      data: [],
      columns: [],
      sorting: [] as SortingState,
      columnVisibility: {},
      rowSelection: {},
      setSorting: (sorting: SortingState) => set(() => ({ sorting })),
      setColumnVisibility: (columnVisibility) => set({ columnVisibility }),
      setRowSelection: (rowSelection) => set({ rowSelection }),
      setData: (data) => set({ data }),
      setColumns: (columns) => set({ columns }),
    }),
    {
      name: "table-storage",
      storage: createJSONStorage(() => encryptedStorage),
    }
  )
);
