"use client";

import * as React from "react";
// import Link from "next/link"; // No longer needed for Advanced View
// import { usePathname } from "next/navigation"; // No longer needed for Advanced View path
import { useTableStore } from "../../stores/table_store";
import { useTableData } from "@/lib/hooks/use-table-data";
import { useEditorStore } from "@/components/stores/editor_store";
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Loader2,
  ExternalLink,
  AlertTriangle,
} from "lucide-react";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  OnChangeFn,
  SortingState,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BetterDataTable } from "./better-data-table";
import DataHeader from "./header";
// Assuming DataDownloadButton is imported correctly.
// You might need to create/update this component.
import { DataDownloadButton } from "@/components/header/buttons/data-download-button";
import { ColumnDef } from "@tanstack/react-table"; // For type safety
import { SQLData } from "../../stores/table_store"; // For type safety

// Maximum number of rows to display in the main view
const MAX_VISIBLE_ROWS = 100;

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
  // --- ALL HOOKS AT THE TOP ---
  // const pathname = usePathname(); // No longer needed
  const { sorting, columnVisibility, rowSelection, setSorting } =
    useTableStore();
  // Use executedQuery instead of current value
  const executedQuery = useEditorStore((state) => state.executedQuery);
  const {
    data: tableQueryResult,
    isLoading,
    isError,
    error,
    isFetching,
  } = useTableData(executedQuery || null);

  // Track if we've seen data before
  const [hasData, setHasData] = React.useState(false);

  React.useEffect(() => {
    // Check if data exists and has length before accessing length property
    if (tableQueryResult?.data && tableQueryResult.data.length > 0) {
      setHasData(true);
    }
  }, [tableQueryResult?.data]);

  React.useEffect(() => {
    setSorting([]);
  }, [setSorting]);

  const handleSortingChange: OnChangeFn<SortingState> = React.useCallback(
    (updater) => {
      const newState =
        typeof updater === "function" ? updater(sorting) : updater;
      setSorting(newState);
    },
    [setSorting, sorting]
  );

  // Memoize data/columns with defaults
  const data = React.useMemo(
    () => tableQueryResult?.data || [],
    [tableQueryResult?.data]
  );
  const columns: ColumnDef<SQLData, any>[] = React.useMemo(
    () => tableQueryResult?.columns || [],
    [tableQueryResult?.columns]
  );

  // Create a limited view of data for rendering (max 100 rows)
  const limitedData = React.useMemo(() => {
    return data.slice(0, MAX_VISIBLE_ROWS);
  }, [data]);

  // Track if data is being limited
  const isDataLimited = data.length > MAX_VISIBLE_ROWS;

  // The actual loading state combines both isLoading and isFetching
  const showLoading = isLoading || (isFetching && !hasData);

  // Always call useReactTable with the limited data
  const table = useReactTable({
    data: limitedData,
    columns: columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: handleSortingChange,
    enableSorting: true,
    state: { sorting, columnVisibility, rowSelection },
  });
  // --- END OF HOOKS ---

  // --- RENDER LOGIC ---
  return (
    <div className="flex flex-col h-full">
      <div className="relative flex-1 overflow-hidden rounded-md border">
        <div className="absolute inset-0 overflow-auto">
          <div className="min-w-full inline-block">
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-background">
                {/* Render header only if not loading/error and columns exist */}
                {!showLoading && !isError && columns.length > 0
                  ? table.getHeaderGroups().map((headerGroup) => (
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
                    ))
                  : null}
                {/* Optional: Render a placeholder row during loading/error if needed */}
                {(showLoading || isError || columns.length === 0) && (
                  <TableRow className="hover:bg-transparent border-b">
                    <TableHead
                      colSpan={columns.length || 1}
                      className="h-[49px]"
                    >
                      {/* Optionally add a subtle loading/error indicator here if desired */}
                    </TableHead>
                  </TableRow>
                )}
              </TableHeader>
              <TableBody>
                {/* Conditional rendering inside the body */}
                {showLoading ? (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length || 1}
                      className="h-16 text-center"
                    >
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mx-auto" />
                    </TableCell>
                  </TableRow>
                ) : isError ? (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length || 1}
                      className="h-16 text-center text-destructive"
                    >
                      <div className="flex flex-col items-center justify-center">
                        <AlertTriangle className="h-6 w-6 mb-1" />
                        <p className="text-sm font-medium">
                          Error Loading Data
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {error instanceof Error
                            ? error.message
                            : "An unknown error occurred"}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : data.length === 0 || columns.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length || 1}
                      className="h-16 text-center"
                    >
                      <p className="text-sm text-muted-foreground">
                        No data available for this query.
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  // Render actual data rows (limited to MAX_VISIBLE_ROWS)
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
                )}

                {/* Add a message row when data is limited */}
                {isDataLimited && !showLoading && !isError && (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="text-center text-xs text-muted-foreground italic py-2 border-t"
                    >
                      Showing {MAX_VISIBLE_ROWS} of {data.length} rows. Use Advanced View to see all data.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
      {/* Footer with row count info and Advanced View button */}
      <div className="px-2 py-1 text-xs text-muted-foreground border-t bg-muted/10 flex justify-between items-center">
        <div>
          {/* Show row count only if not loading/error and data exists */}
          {!showLoading && !isError && data.length > 0 && (
            <>
              {data.length} rows
              {isDataLimited && <> (showing {MAX_VISIBLE_ROWS})</>}
              {table.getSelectedRowModel?.()?.rows?.length > 0 &&
                ` (${table.getSelectedRowModel().rows.length} selected)`}
            </>
          )}
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="link"
              className="text-primary hover:underline inline-flex items-center gap-1 h-auto p-0 text-xs"
              disabled={showLoading || isError || data.length === 0} // Disable if no data or error
            >
              Advanced View
              <ExternalLink className="h-3 w-3" />
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[95vw] h-[90vh] flex flex-col p-0 border rounded-lg overflow-hidden">
            <div className="bg-muted/30 p-3 border-b">
              <DialogHeader className="gap-1">
                <DialogTitle className="text-xl">
                  Advanced Data View
                </DialogTitle>
                <DialogDescription className="text-sm">
                  View, sort, filter, and download your query results.
                </DialogDescription>
              </DialogHeader>
              {/* Pass FULL data and columns to DataHeader */}
              <div className="mt-3">
                <DataHeader data={data} columns={columns} />
              </div>
            </div>
            <div className="flex-grow overflow-hidden p-2">
              {/* Pass FULL data, columns, and loading state to BetterDataTable */}
              <BetterDataTable
                data={data}
                columns={columns}
                isLoading={showLoading}
              />
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
