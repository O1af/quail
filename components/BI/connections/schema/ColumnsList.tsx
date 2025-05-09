"use client";

import { Column } from "@/components/stores/table_store";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ClipboardCopy } from "lucide-react";
import { useToast } from "@/lib/hooks/use-toast";
import { cn } from "@/lib/utils";
import { memo, useCallback, useMemo } from "react";

interface ColumnsListProps {
  columns: Column[];
}

export const ColumnsList = memo(function ColumnsList({
  columns,
}: ColumnsListProps) {
  const { toast } = useToast();

  const copyColumnName = useCallback(
    (name: string) => {
      navigator.clipboard.writeText(name);
      toast({
        description: `Column "${name}" copied to clipboard`,
        duration: 2000,
      });
    },
    [toast]
  );

  // Memoize the sorting operation to avoid recalculating on every render
  const sortedColumns = useMemo(() => {
    return [...columns].sort(
      (a, b) => (a.ordinalPosition || 0) - (b.ordinalPosition || 0)
    );
  }, [columns]);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[30%]">Name</TableHead>
          <TableHead className="w-[25%]">Type</TableHead>
          <TableHead className="w-[20%]">Constraints</TableHead>
          <TableHead>Attributes</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sortedColumns.map((column) => (
          <TableRow key={column.name}>
            <TableCell>
              <div className="flex items-center space-x-2">
                <span className={cn(column.isPrimary && "font-medium")}>
                  {column.name}
                </span>
                <button
                  onClick={() => copyColumnName(column.name)}
                  className="opacity-30 hover:opacity-100"
                >
                  <ClipboardCopy size={14} />
                </button>
              </div>
            </TableCell>
            <TableCell>
              {column.dataType}
              {column.characterMaximumLength &&
                `(${column.characterMaximumLength})`}
              {column.numericPrecision && `(${column.numericPrecision})`}
            </TableCell>
            <TableCell>
              <div className="flex flex-wrap gap-1">
                {column.isPrimary && <Badge variant="default">PK</Badge>}
                {column.isUnique && <Badge variant="secondary">UQ</Badge>}
                {column.isForeignKey && <Badge variant="outline">FK</Badge>}
                {column.isNullable === "NO" && (
                  <Badge variant="destructive">NOT NULL</Badge>
                )}
              </div>
            </TableCell>
            <TableCell>
              <div className="flex flex-wrap gap-1">
                {column.isIdentity && <Badge variant="outline">Identity</Badge>}
                {column.columnDefault && (
                  <span className="text-xs text-muted-foreground">
                    Default: {column.columnDefault}
                  </span>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}

        {columns.length === 0 && (
          <TableRow>
            <TableCell
              colSpan={4}
              className="text-center py-4 text-muted-foreground"
            >
              No columns found
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
});
