"use client";

import { useState, useCallback, memo, useEffect } from "react";
import { useDbStore } from "@/components/stores/db_mongo_client";
import { ConnectionsList } from "./ConnectionsList";
import { ConnectionForm } from "./ConnectionForm";
import { useToast } from "@/lib/hooks/use-toast";
import { useConnectionsState } from "@/lib/hooks/useConnectionsState";

export const Connections = memo(function Connections() {
  const [isDbLoading, setIsDbLoading] = useState(true);
  const {
    databases,
    addDatabase,
    removeDatabase,
    updateDatabase,
    currentDatabaseId,
    loadDatabases,
  } = useDbStore();

  const {
    isCreating,
    editingConnectionId,
    closeConnectionForm,
    openAddConnectionForm,
    openEditConnectionForm,
  } = useConnectionsState();

  const { toast } = useToast();

  // Load databases once on component mount
  useEffect(() => {
    loadDatabases()
      .catch(console.error)
      .finally(() => setIsDbLoading(false));
  }, [loadDatabases]);

  // Get connection being edited if any
  const connectionBeingEdited =
    editingConnectionId !== null
      ? databases.find((db) => db.id === editingConnectionId)
      : undefined;

  // Database operations with error handling patterns
  const databaseOperations = {
    add: useCallback(
      async (data: any) => {
        try {
          await addDatabase(data);
          closeConnectionForm();
          toast({
            title: "Connection added",
            description: `Successfully added ${data.name} database connection.`,
          });
        } catch (error) {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to add database connection.",
          });
        }
      },
      [addDatabase, toast, closeConnectionForm]
    ),

    update: useCallback(
      async (id: number, data: any) => {
        try {
          await updateDatabase(id, data);
          closeConnectionForm();
          toast({
            title: "Connection updated",
            description: `Successfully updated ${data.name} database connection.`,
          });
        } catch (error) {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to update database connection.",
          });
        }
      },
      [updateDatabase, toast, closeConnectionForm]
    ),

    remove: useCallback(
      async (id: number, name: string) => {
        try {
          await removeDatabase(id);
          toast({
            title: "Connection removed",
            description: `Successfully removed ${name} database connection.`,
          });
        } catch (error) {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to remove database connection.",
          });
        }
      },
      [removeDatabase, toast]
    ),
  };

  if (isDbLoading) {
    // Optimistic UI
    return (
      <div className="opacity-50 transition-opacity">
        <ConnectionsList
          connections={[]}
          currentConnectionId={null}
          onUpdate={() => {}}
          onRemove={() => {}}
          onAddNew={() => {}}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {isCreating && (
        <ConnectionForm
          onSubmit={databaseOperations.add}
          onCancel={closeConnectionForm}
        />
      )}

      {editingConnectionId !== null && connectionBeingEdited && (
        <ConnectionForm
          onSubmit={(data) =>
            databaseOperations.update(editingConnectionId, data)
          }
          onCancel={closeConnectionForm}
          defaultValues={connectionBeingEdited}
          isEditing={true}
        />
      )}

      <ConnectionsList
        connections={databases}
        currentConnectionId={currentDatabaseId}
        onUpdate={openEditConnectionForm}
        onRemove={databaseOperations.remove}
        onAddNew={openAddConnectionForm}
      />
    </div>
  );
});
