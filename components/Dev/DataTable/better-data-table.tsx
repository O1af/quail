"use client";

import * as React from "react";
import { useTableStore } from "../../stores/table_store";
import { ArrowUpDown, ArrowUp, ArrowDown, Loader2 } from "lucide-react";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
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
import { ColumnDef } from "@tanstack/react-table";
import { SQLData } from "../../stores/table_store";
import { DataTablePagination } from "./pagination";

const SortIcon = ({ sortDirection }: { sortDirection: string | false }) => {
  if (sortDirection === "desc") return <ArrowUp className="h-4 w-4" />;
  if (sortDirection === "asc") return <ArrowDown className="h-4 w-4" />;
  return <ArrowUpDown className="h-4 w-4" />;
};

const selectionColumn: ColumnDef<SQLData, any> = {
  id: "select",
  header: ({ table }) => (
    <input
      type="checkbox"
      checked={table.getIsAllPageRowsSelected()}
      onChange={(e) => table.toggleAllPageRowsSelected(e.target.checked)}
      className="h-4 w-4 rounded border-gray-300"
    />
  ),
  cell: ({ row }) => (
    <input
      type="checkbox"
      checked={row.getIsSelected()}
      onChange={(e) => row.toggleSelected(e.target.checked)}
      className="h-4 w-4 rounded border-gray-300"
    />
  ),
  enableSorting: false,
  size: 40,
};

export function BetterDataTable() {
  const {
    data = [],
    columns: baseColumns = [],
    sorting,
    columnVisibility,
    rowSelection,
    setSorting,
    setRowSelection,
    isLoading,
    pagination,
    setPagination,
    globalFilter,
    rowSizePreference,
    setColumnVisibility,
  } = useTableStore();

  // Memoize columns with selection column, but only add if it doesn't exist
  const columns = React.useMemo(() => {
    const hasSelectionColumn = baseColumns.some((col) => col.id === "select");
    return hasSelectionColumn ? baseColumns : [selectionColumn, ...baseColumns];
  }, [baseColumns]);

  const table = useReactTable({
    data,
    columns, // Use the memoized columns instead
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: (updater) =>
      setSorting(updater instanceof Function ? updater(sorting) : updater),
    onRowSelectionChange: (updater) =>
      setRowSelection(
        updater instanceof Function ? updater(rowSelection) : updater
      ),
    onPaginationChange: (updater) =>
      setPagination(
        updater instanceof Function ? updater(pagination) : updater
      ),
    onColumnVisibilityChange: (updater) =>
      setColumnVisibility(
        updater instanceof Function ? updater(columnVisibility) : updater
      ),
    enableRowSelection: true,
    enableMultiRowSelection: true,
    enableSorting: true,
    globalFilterFn: "includesString",
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      pagination: { ...pagination, pageSize: rowSizePreference },
      globalFilter,
    },
  });

  if (!data.length || !columns.length) {
    return (
      <div className="flex h-full w-full items-center justify-center rounded-md border">
        <p className="text-sm text-muted-foreground">No data available</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 relative border rounded-md">
        <div className="absolute inset-0 overflow-auto">
          <Table className="w-full">
            <TableHeader className="sticky top-0 z-10 bg-background">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="hover:bg-transparent">
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className="whitespace-nowrap bg-muted/50 py-1.5 px-3"
                      style={{
                        width: header.getSize(),
                        maxWidth: header.getSize(),
                      }}
                    >
                      {header.isPlaceholder ? null : (
                        <div
                          className={`flex items-center gap-1 ${
                            header.column.getCanSort()
                              ? "cursor-pointer select-none"
                              : ""
                          }`}
                          onClick={header.column.getToggleSortingHandler()}
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
                      <div
                        onMouseDown={header.getResizeHandler()}
                        onTouchStart={header.getResizeHandler()}
                        className={`absolute right-0 top-0 h-full w-1 cursor-col-resize select-none touch-none
                          ${header.column.getIsResizing() ? "bg-primary" : ""}`}
                      />
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
                    className="h-24 text-center"
                  >
                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                  </TableCell>
                </TableRow>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className="hover:bg-muted/50"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="px-3 py-1.5">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      <DataTablePagination table={table} />
    </div>
  );
}
