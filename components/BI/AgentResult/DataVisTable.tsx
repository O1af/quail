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
import { useState } from "react";
import { ArrowUpDown, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DataVisTableProps {
  data?: PostgresResponse;
}

export function DataVisTable({ data }: DataVisTableProps) {
  if (!data || !data.rows || data.rows.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        No data available
      </div>
    );
  }

  const downloadCSV = () => {
    if (!data.rows.length) return;

    const headers = Object.keys(data.rows[0]);
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

    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "data_export.csv");
    link.click();
  };

  return (
    <div className="h-full flex flex-col gap-2">
      <ScrollArea className="flex-1 border rounded-md">
        <Table>
          <TableHeader className="sticky top-0 bg-background z-10">
            <TableRow>
              {Object.keys(data.rows[0]).map((key) => (
                <TableHead
                  key={key}
                  className="whitespace-nowrap cursor-pointer hover:bg-muted/50"
                >
                  <div className="flex items-center gap-1">{key}</div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.rows.map((row, i) => (
              <TableRow key={i}>
                {Object.entries(row).map(([key, value]: [string, any], j) => (
                  <TableCell
                    key={j}
                    className="truncate max-w-[200px]"
                    title={
                      typeof value === "object"
                        ? JSON.stringify(value)
                        : String(value)
                    }
                  >
                    {typeof value === "object" ? (
                      <Badge variant="outline" className="font-mono text-xs">
                        {JSON.stringify(value).substring(0, 30)}
                        {JSON.stringify(value).length > 30 ? "..." : ""}
                      </Badge>
                    ) : (
                      String(value)
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
}
