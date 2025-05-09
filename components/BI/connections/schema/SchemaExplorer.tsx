"use client";

import { useState, useEffect, useCallback, memo } from "react";
import { useDatabaseStructure } from "@/lib/hooks/use-table-data";
import { SchemaTree } from "./SchemaTree";
import { TableDetails } from "./TableDetails";
import { RelationshipPanel } from "./RelationshipPanel";
import { ResizablePanelGroup, ResizablePanel } from "@/components/ui/resizable";
import type { Table } from "@/components/stores/table_store"; // Use 'import type'

interface SchemaExplorerProps {
  searchTerm: string;
}

// Memoize the main components to prevent unnecessary renders
const MemoizedTableDetails = memo(TableDetails);
const MemoizedRelationshipPanel = memo(RelationshipPanel);

export function SchemaExplorer({ searchTerm }: SchemaExplorerProps) {
  // Use the React Query hook for database structure
  const { data: databaseStructure = { schemas: [] } } = useDatabaseStructure();
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [showRelationships, setShowRelationships] = useState(false);

  // Use useCallback to memoize functions passed as props
  const handleSelectTable = useCallback((table: Table) => {
    setSelectedTable(table);
  }, []);

  const handleToggleRelationships = useCallback(() => {
    setShowRelationships((prev) => !prev);
  }, []);

  return (
    <ResizablePanelGroup direction="horizontal" className="h-full">
      <ResizablePanel defaultSize={25} minSize={15}>
        <SchemaTree
          searchTerm={searchTerm}
          onSelectTable={handleSelectTable}
          selectedTable={selectedTable}
        />
      </ResizablePanel>

      <ResizablePanel defaultSize={showRelationships ? 50 : 75} minSize={30}>
        {selectedTable ? (
          <MemoizedTableDetails
            table={selectedTable}
            onToggleRelationships={handleToggleRelationships}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            Select a table to view details
          </div>
        )}
      </ResizablePanel>

      {showRelationships && (
        <ResizablePanel defaultSize={25} minSize={15}>
          <MemoizedRelationshipPanel table={selectedTable} />
        </ResizablePanel>
      )}
    </ResizablePanelGroup>
  );
}
