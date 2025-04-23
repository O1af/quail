"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTableStore } from "../../stores/table_store";
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Loader2,
  ExternalLink,
} from "lucide-react";
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
  const pathname = usePathname();
  const {
    data,
    columns,
    sorting,
    columnVisibility,
    rowSelection,
    setSorting,
    isLoading,
  } = useTableStore();

  // Initialize sorting only once when component mounts
  React.useEffect(() => {
    setSorting([]);
  }, [setSorting]); // Add setSorting as dependency

  const handleSortingChange = React.useCallback(
    (updater: any) => {
      setSorting(typeof updater === "function" ? updater(sorting) : updater);
    },
    [setSorting, sorting] // Remove columns from dependencies
  );

  const table = useReactTable({
    data: data || [],
    columns: columns || [],
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: handleSortingChange,
    enableSorting: true,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
    },
  });

  // Early return after hooks
  if (!data || !columns || columns.length === 0) {
    return (
      <div className="flex h-[200px] w-full items-center justify-center rounded-md border">
        <p className="text-sm text-muted-foreground">No data available</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="relative flex-1 overflow-hidden rounded-md border">
        <div className="absolute inset-0 overflow-auto">
          <div className="min-w-full inline-block">
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-background">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow
                    key={headerGroup.id}
                    className="hover:bg-transparent border-b"
                  >
                    {headerGroup.headers.map((header, index) => (
                      <TableHead
                        key={header.id}
                        className={`whitespace-nowrap bg-muted/50 py-2 px-4 text-sm min-w-[150px] ${
                          index === headerGroup.headers.length - 1
                            ? ""
                            : "border-r"
                        }`}
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
                      {row.getVisibleCells().map((cell, index) => (
                        <TableCell
                          key={cell.id}
                          className={`px-4 py-1 text-sm whitespace-nowrap min-w-[150px] ${
                            index === row.getVisibleCells().length - 1
                              ? ""
                              : "border-r"
                          }`}
                        >
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
                      <p className="text-sm text-muted-foreground">
                        No results.
                      </p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
      <div className="px-2 py-1 text-xs text-muted-foreground border-t bg-muted/10 flex justify-between items-center">
        <div>
          {table.getRowModel().rows?.length ?? 0} rows
          {table.getSelectedRowModel?.()?.rows?.length > 0 &&
            ` (${table.getSelectedRowModel().rows.length} selected)`}
        </div>
        <Link
          href={pathname.replace(/\/*$/, "") + "/data"}
          className="text-primary hover:underline inline-flex items-center gap-1"
          target="_blank"
          rel="noopener noreferrer"
        >
          Advanced View
          <ExternalLink className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}
