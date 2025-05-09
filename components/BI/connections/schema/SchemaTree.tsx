"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { useDatabaseStructure } from "@/lib/hooks/use-table-data";
import {
  ChevronRight,
  ChevronDown,
  Database,
  Table as TableIcon,
  LayoutList,
} from "lucide-react";
import type { Table } from "@/components/stores/table_store"; // Use 'import type'
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { memo } from "react";

interface SchemaTreeProps {
  searchTerm: string;
  selectedTable: Table | null;
  onSelectTable: (table: Table) => void;
}

// Memoized TableItem component to prevent unnecessary re-renders
const TableItem = memo(
  ({
    table,
    isSelected,
    onSelect,
  }: {
    table: Table;
    isSelected: boolean;
    onSelect: () => void;
  }) => {
    // Determine which icon to use based on table type (case-insensitive comparison)
    const isView = table.type.toLowerCase().includes("view");
    const TableTypeIcon = isView ? LayoutList : TableIcon;

    return (
      <div
        className={cn(
          "flex items-center p-2 cursor-pointer rounded-md",
          isSelected ? "bg-muted font-medium" : "hover:bg-muted"
        )}
        onClick={onSelect}
      >
        <TableTypeIcon size={16} className="mr-2" />
        <span>{table.name}</span>
      </div>
    );
  }
);

TableItem.displayName = "TableItem";

// Memoized SchemaItem component
const SchemaItem = memo(
  ({
    schema,
    isExpanded,
    onToggle,
    selectedTable,
    onSelectTable,
  }: {
    schema: { name: string; tables: Table[] }; // Use Table type
    isExpanded: boolean;
    onToggle: () => void;
    selectedTable: Table | null;
    onSelectTable: (table: Table) => void;
  }) => {
    return (
      <div className="select-none">
        <div
          className="flex items-center p-2 cursor-pointer hover:bg-muted rounded-md"
          onClick={onToggle}
        >
          {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          <Database size={16} className="ml-1 mr-2" />
          <span className="font-medium">{schema.name}</span>
          <span className="ml-auto text-xs text-muted-foreground">
            {schema.tables.length}
          </span>
        </div>

        {isExpanded && (
          <div className="ml-6 pl-2 border-l">
            {schema.tables.map((table) => (
              <TableItem
                key={`${schema.name}.${table.name}`}
                table={table}
                isSelected={selectedTable?.name === table.name}
                onSelect={() => onSelectTable(table)}
              />
            ))}
          </div>
        )}
      </div>
    );
  }
);

SchemaItem.displayName = "SchemaItem";

export function SchemaTree({
  searchTerm,
  selectedTable,
  onSelectTable,
}: SchemaTreeProps) {
  const { data: databaseStructure = { schemas: [] } } = useDatabaseStructure();
  const { schemas } = databaseStructure;
  const [expandedSchemas, setExpandedSchemas] = useState<
    Record<string, boolean>
  >({});

  // Use useCallback for toggle function to prevent unnecessary re-renders
  const toggleSchema = useCallback((schemaName: string) => {
    setExpandedSchemas((prev) => ({
      ...prev,
      [schemaName]: !prev[schemaName],
    }));
  }, []);

  // Memoize filtered schemas to prevent recalculation on every render
  const filteredSchemas = useMemo(() => {
    if (!searchTerm) return schemas;

    const lowerSearchTerm = searchTerm.toLowerCase();
    return schemas
      .map((schema) => ({
        ...schema,
        tables: schema.tables.filter(
          (table) =>
            table.name.toLowerCase().includes(lowerSearchTerm) ||
            table.columns.some((col) =>
              col.name.toLowerCase().includes(lowerSearchTerm)
            )
        ),
      }))
      .filter(
        (schema) =>
          schema.tables.length > 0 ||
          schema.name.toLowerCase().includes(lowerSearchTerm)
      );
  }, [schemas, searchTerm]);

  // Auto-expand schemas when searching
  useEffect(() => {
    if (searchTerm) {
      const newExpandedState: Record<string, boolean> = {};
      filteredSchemas.forEach((schema) => {
        if (schema.tables.length > 0) {
          newExpandedState[schema.name] = true;
        }
      });
      setExpandedSchemas((prev) => ({ ...prev, ...newExpandedState }));
    }
  }, [searchTerm, filteredSchemas]);

  return (
    <ScrollArea className="h-full border rounded-md bg-background p-2">
      <div className="space-y-1">
        {filteredSchemas.map((schema) => (
          <SchemaItem
            key={schema.name}
            schema={schema}
            isExpanded={!!expandedSchemas[schema.name]}
            onToggle={() => toggleSchema(schema.name)}
            selectedTable={selectedTable}
            onSelectTable={onSelectTable}
          />
        ))}

        {filteredSchemas.length === 0 && (
          <div className="p-4 text-center text-muted-foreground">
            No schemas or tables found
          </div>
        )}
      </div>
    </ScrollArea>
  );
}
