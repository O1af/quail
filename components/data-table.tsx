"use client";

import * as React from "react";
import { useTableStore } from "./stores/table_store";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Reusable SortIcon component
const SortIcon = ({ sortDirection }: { sortDirection: string | false }) => {
  if (sortDirection === "desc") return <ArrowUp className="h-4 w-4" />;
  if (sortDirection === "asc") return <ArrowDown className="h-4 w-4" />;
  return <ArrowUpDown className="h-4 w-4" />;
};

function handleHeaderClick(column: any) {
  if (column.getCanSort()) {
    column.toggleSorting(column.getIsSorted() === "asc");
  }
}

export function DataTable() {
  const { data, columns, sorting, columnVisibility, rowSelection, setSorting } =
    useTableStore();

  const handleSortingChange = React.useCallback(
    (updater: any) => {
      setSorting(typeof updater === "function" ? updater(sorting) : updater);
    },
    [setSorting, sorting]
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(), // add this
    onSortingChange: handleSortingChange,
    enableSorting: true,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <div className="relative h-full w-full overflow-auto rounded-md border">
      <Table>
        <TableHeader className="sticky top-0 z-10 bg-background">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="hover:bg-transparent">
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id} className="whitespace-nowrap">
                  {!header.isPlaceholder && (
                    <div
                      className={`flex items-center ${
                        header.column.getCanSort()
                          ? "cursor-pointer select-none"
                          : ""
                      }`}
                      onClick={() => handleHeaderClick(header.column)}
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                      {header.column.getCanSort() && (
                        <span className="ml-2">
                          <SortIcon
                            sortDirection={header.column.getIsSorted()}
                          />
                        </span>
                      )}
                    </div>
                  )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="whitespace-nowrap">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
