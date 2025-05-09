"use client";

import { Input } from "@/components/ui/input";
import { useTableStore } from "@/components/stores/table_store";
import { DataTableViewOptions } from "./edit-view";
import {
  useReactTable,
  getCoreRowModel,
  ColumnDef,
} from "@tanstack/react-table";
import { SQLData } from "@/components/stores/table_store";
import { Search } from "lucide-react";
import { DataDownloadButton } from "@/components/header/buttons/data-download-button";

interface DataHeaderProps {
  data: SQLData[];
  columns: ColumnDef<SQLData, any>[];
}

export default function DataHeader({ data, columns }: DataHeaderProps) {
  const { setGlobalFilter, globalFilter } = useTableStore();

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-2 flex-1">
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search across all columns..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="pl-9 bg-background"
          />
        </div>
        <DataDownloadButton data={data} columns={columns} />
      </div>
      <DataTableViewOptions table={table} />
    </div>
  );
}
