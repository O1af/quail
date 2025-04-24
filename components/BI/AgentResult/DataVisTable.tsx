"use client";

import { PostgresResponse } from "@/lib/types/DBQueryTypes";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { memo, useCallback, useMemo } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DataVisTableProps {
  data?: PostgresResponse;
}

// Memoize the empty state component
const EmptyState = memo(() => (
  <div className="flex items-center justify-center h-full text-muted-foreground">
    No data available
  </div>
));

// Memoize table header component
const TableHeaderRow = memo(({ keys }: { keys: string[] }) => (
  <TableRow>
    {keys.map((key) => (
      <TableHead
        key={key}
        className="whitespace-nowrap cursor-pointer hover:bg-muted/50"
      >
        <div className="flex items-center gap-1">{key}</div>
      </TableHead>
    ))}
  </TableRow>
));

// Memoize table cell component
const MemoizedTableCell = memo(
  ({ value, keyName }: { value: any; keyName: string }) => {
    const displayValue = useMemo(() => {
      const isObject = typeof value === "object";
      const stringValue = isObject ? JSON.stringify(value) : String(value);

      if (isObject) {
        return (
          <Badge variant="outline" className="font-mono text-xs">
            {stringValue.substring(0, 30)}
            {stringValue.length > 30 ? "..." : ""}
          </Badge>
        );
      }

      return stringValue;
    }, [value]);

    const titleValue = useMemo(() => {
      return typeof value === "object" ? JSON.stringify(value) : String(value);
    }, [value]);

    return (
      <TableCell className="truncate max-w-[200px]" title={titleValue}>
        {displayValue}
      </TableCell>
    );
  }
);

export function DataVisTable({ data }: DataVisTableProps) {
  // Early return for empty data
  if (!data?.rows?.length) {
    return <EmptyState />;
  }

  // Memoize headers to avoid recalculation
  const headers = useMemo(() => Object.keys(data.rows[0]), [data.rows]);

  // Memoize the CSV generation function
  const generateCSV = useCallback(() => {
    const csvRows = [
      headers.join(","),
      ...data.rows.map((row) =>
        headers
          .map((header) => {
            const value = row[header];
            return typeof value === "object"
              ? `"${JSON.stringify(value).replace(/"/g, '""')}"`
              : `"${String(value).replace(/"/g, '""')}"`;
          })
          .join(",")
      ),
    ];
    return csvRows.join("\n");
  }, [data.rows, headers]);

  // Download CSV function
  const downloadCSV = useCallback(() => {
    const csvContent = generateCSV();
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "data_export.csv");
    link.click();
  }, [generateCSV]);

  return (
    <div className="h-full flex flex-col gap-2">
      <div className="flex justify-end">
        <Button
          size="sm"
          variant="outline"
          className="flex items-center gap-1"
          onClick={downloadCSV}
        >
          <Download size={14} /> Export CSV
        </Button>
      </div>
      <ScrollArea className="flex-1 border rounded-md">
        <Table>
          <TableHeader className="sticky top-0 bg-background z-10">
            <TableHeaderRow keys={headers} />
          </TableHeader>
          <TableBody>
            {data.rows.map((row, i) => (
              <TableRow key={i}>
                {headers.map((key, j) => (
                  <MemoizedTableCell key={j} value={row[key]} keyName={key} />
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
}

// Export a memoized version of the component
export default memo(DataVisTable);
