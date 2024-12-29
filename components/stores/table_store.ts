import { create } from "zustand";
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

const mockData: SQLData[] = [
  { id: 1, name: "John Doe", age: 28, email: "john@example.com" },
  { id: 2, name: "Jane Smith", age: 34, email: "jane@example.com" },
  { id: 3, name: "Sam Johnson", age: 45, email: "sam@example.com" },
  { id: 4, name: "Alice Brown", age: 29, email: "alice@example.com" },
  { id: 5, name: "Bob White", age: 32, email: "bob@example.com" },
  { id: 6, name: "Charlie Black", age: 40, email: "charlie@example.com" },
  { id: 7, name: "Diana Green", age: 27, email: "diana@example.com" },
  { id: 8, name: "Evan Blue", age: 35, email: "evan@example.com" },
  { id: 9, name: "Fiona Red", age: 30, email: "fiona@example.com" },
  { id: 10, name: "George Yellow", age: 38, email: "george@example.com" },
];

const mockColumns: ColumnDef<SQLData, any>[] = [
  {
    accessorKey: "id",
    header: "ID",
    enableSorting: true,
    sortingFn: "basic",
  },
  {
    accessorKey: "name",
    header: "Name",
    enableSorting: true,
    sortingFn: "basic",
  },
  {
    accessorKey: "age",
    header: "Age",
    enableSorting: true,
    sortingFn: "basic",
  },
  {
    accessorKey: "email",
    header: "Email",
    enableSorting: true,
    sortingFn: "basic",
  },
];

export const useTableStore = create<TableStore>((set) => ({
  data: mockData,
  columns: mockColumns,
  sorting: [] as SortingState, // explicitly type as SortingState
  columnVisibility: {},
  rowSelection: {},
  setSorting: (sorting: SortingState) => set(() => ({ sorting })),
  setColumnVisibility: (columnVisibility) => set({ columnVisibility }),
  setRowSelection: (rowSelection) => set({ rowSelection }),
  setData: (data) => set({ data }),
  setColumns: (columns) => set({ columns }),
}));
