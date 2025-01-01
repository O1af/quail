"use client";

import * as React from "react";
import { useTableStore } from "./stores/table_store";
import { ArrowUpDown, ArrowUp, ArrowDown, Loader2 } from "lucide-react";
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
  const {
    data,
    columns,
    sorting,
    columnVisibility,
    rowSelection,
    setSorting,
    isLoading,
  } = useTableStore();

  // Add error handling for missing data
  if (!data || !columns) {
    return (
      <div className="flex h-[200px] w-full items-center justify-center rounded-md border">
        <p className="text-sm text-muted-foreground">No data available</p>
      </div>
    );
  }

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
    <div className="flex flex-col h-full">
      <div className="relative flex-1 overflow-auto rounded-md border">
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-background">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="hover:bg-transparent border-b"
              >
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="whitespace-nowrap bg-muted/50 py-2 px-2 text-sm"
                  >
                    {!header.isPlaceholder && (
                      <div
                        className={`flex items-center gap-1 ${
                          header.column.getCanSort()
                            ? "cursor-pointer select-none hover:text-primary"
                            : ""
                        }`}
                        onClick={() => handleHeaderClick(header.column)}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {header.column.getCanSort() && (
                          <SortIcon
                            sortDirection={header.column.getIsSorted()}
                          />
                        )}
                      </div>
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-16 text-center"
                >
                  <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row, index) => (
                <TableRow
                  key={row.id}
                  className={`
                    hover:bg-muted/50
                    ${index % 2 === 0 ? "bg-background" : "bg-muted/10"}
                  `}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="px-2 py-1 text-sm">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-16 text-center"
                >
                  <p className="text-sm text-muted-foreground">No results.</p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="px-2 py-1 text-xs text-muted-foreground border-t bg-muted/10">
        {table.getRowModel().rows?.length ?? 0} rows
        {table.getSelectedRowModel?.()?.rows?.length > 0 &&
          ` (${table.getSelectedRowModel().rows.length} selected)`}
      </div>
    </div>
  );
}
