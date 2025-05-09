"use client";

import { Table } from "@/components/stores/table_store";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Network } from "lucide-react";
import { ColumnsList } from "./ColumnsList";
import { IndexesList } from "./IndexesList";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { memo } from "react";

interface TableDetailsProps {
  table: Table | null;
  onToggleRelationships: () => void;
}

// Memoize sub-components
const MemoizedColumnsList = memo(ColumnsList);
const MemoizedIndexesList = memo(IndexesList);

export const TableDetails = memo(function TableDetails({
  table,
  onToggleRelationships,
}: TableDetailsProps) {
  if (!table) return null;

  return (
    <div className="h-full flex flex-col p-2">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-bold">{table.name}</h2>
          <p className="text-sm text-muted-foreground">{table.type}</p>
        </div>
        <Button variant="outline" size="sm" onClick={onToggleRelationships}>
          <Network size={16} className="mr-2" />
          Toggle Relationships
        </Button>
      </div>

      <Card className="flex-1 overflow-hidden">
        <CardHeader className="pb-0">
          <CardTitle>Table Structure</CardTitle>
          {table.comment && <CardDescription>{table.comment}</CardDescription>}
        </CardHeader>
        <CardContent className="pt-4 h-[calc(100%-80px)]">
          <Tabs defaultValue="columns" className="h-full flex flex-col">
            <TabsList>
              <TabsTrigger value="columns">Columns</TabsTrigger>
              <TabsTrigger value="indexes">Indexes</TabsTrigger>
            </TabsList>
            <TabsContent value="columns" className="flex-1 overflow-y-auto">
              <MemoizedColumnsList columns={table.columns} />
            </TabsContent>
            <TabsContent value="indexes" className="flex-1 overflow-y-auto">
              <MemoizedIndexesList indexes={table.indexes} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
});
