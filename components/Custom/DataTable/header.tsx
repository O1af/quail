"use client";

import { Input } from "@/components/ui/input";
import { useTableStore } from "@/components/stores/table_store";
import { DataTableViewOptions } from "./edit-view";
import { useReactTable, getCoreRowModel } from "@tanstack/react-table";

export default function DataHeader() {
  const { setGlobalFilter, globalFilter, data, columns } = useTableStore();

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="flex items-center justify-between gap-4 px-4">
      <Input
        placeholder="Search all columns..."
        value={globalFilter}
        onChange={(e) => setGlobalFilter(e.target.value)}
        className="max-w-xs"
      />
      <DataTableViewOptions table={table} />
    </div>
  );
}
