"use client";

import { Table } from "@/components/stores/table_store";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { memo } from "react";

interface RelationshipPanelProps {
  table: Table | null;
}

export const RelationshipPanel = memo(function RelationshipPanel({
  table,
}: RelationshipPanelProps) {
  if (!table) return null;

  // Find columns with foreign keys
  const foreignKeyColumns = table.columns.filter((col) => col.isForeignKey);

  // In a real implementation, you would also find tables that reference this table
  const referencingTables: { tableName: string; columnName: string }[] = [];

  return (
    <ScrollArea className="h-full p-2">
      <Card>
        <CardHeader>
          <CardTitle>Relationships</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {foreignKeyColumns.length > 0 && (
              <div>
                <h3 className="text-sm font-medium mb-2">
                  References to Other Tables
                </h3>
                <div className="space-y-2">
                  {foreignKeyColumns.map((column) => (
                    <div
                      key={column.name}
                      className="flex items-center p-2 border rounded-md bg-muted/50"
                    >
                      <div className="flex-1">
                        <p className="font-medium">
                          {table.name}.{column.name}
                        </p>
                      </div>
                      <ArrowRight size={16} className="mx-2" />
                      <div className="flex-1">
                        <p className="font-medium">
                          {column.referencedTable}.{column.referencedColumn}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {referencingTables.length > 0 && (
              <div>
                <h3 className="text-sm font-medium mb-2">
                  Referenced by Other Tables
                </h3>
                <div className="space-y-2">
                  {referencingTables.map((ref, index) => (
                    <div
                      key={index}
                      className="flex items-center p-2 border rounded-md bg-muted/50"
                    >
                      <div className="flex-1">
                        <p className="font-medium">
                          {ref.tableName}.{ref.columnName}
                        </p>
                      </div>
                      <ArrowRight size={16} className="mx-2" />
                      <div className="flex-1">
                        <p className="font-medium">
                          {table.name}.{/* Primary key column */}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {foreignKeyColumns.length === 0 &&
              referencingTables.length === 0 && (
                <div className="text-center p-4 text-muted-foreground">
                  No relationships found for this table
                </div>
              )}
          </div>
        </CardContent>
      </Card>
    </ScrollArea>
  );
});
