"use client";

import { Index } from "@/components/stores/table_store";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { memo } from "react";

interface IndexesListProps {
  indexes: Index[];
}

export const IndexesList = memo(function IndexesList({
  indexes,
}: IndexesListProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[30%]">Name</TableHead>
          <TableHead className="w-[40%]">Columns</TableHead>
          <TableHead>Type</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {indexes.map((index) => (
          <TableRow key={index.name}>
            <TableCell>{index.name}</TableCell>
            <TableCell>
              <div className="flex flex-wrap gap-1">
                {index.columns.map((column) => (
                  <Badge key={column} variant="outline">
                    {column}
                  </Badge>
                ))}
              </div>
            </TableCell>
            <TableCell>
              <div className="flex flex-wrap gap-1">
                {index.isPrimary && <Badge>Primary</Badge>}
                {index.isUnique && <Badge variant="secondary">Unique</Badge>}
                {!index.isPrimary && !index.isUnique && (
                  <Badge variant="outline">Regular</Badge>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}

        {indexes.length === 0 && (
          <TableRow>
            <TableCell
              colSpan={3}
              className="text-center py-4 text-muted-foreground"
            >
              No indexes found
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
});
