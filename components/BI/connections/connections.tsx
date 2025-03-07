"use client";

import { useDbStore } from "@/components/stores/db_store";
import { ConnectionsList } from "./ConnectionsList";
import { ConnectionForm } from "./ConnectionForm";
import { useState, useCallback, memo, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useConnectionsState } from "@/hooks/useConnectionsState";

export const Connections = memo(function Connections() {
  const {
    databases,
    addDatabase,
    removeDatabase,
    updateDatabase,
    currentDatabaseId,
  } = useDbStore();

  const {
    isCreating,
    editingConnectionId,
    closeConnectionForm,
    openAddConnectionForm,
    openEditConnectionForm,
  } = useConnectionsState();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);

  // Handle loading state
  useEffect(() => {
    // Simulate loading for better UX
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  // Connection being edited if any
  const connectionBeingEdited =
    editingConnectionId !== null
      ? databases.find((db) => db.id === editingConnectionId)
      : undefined;

  const handleAddDatabase = useCallback(
    async (data: any) => {
      try {
        addDatabase(data);
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
  );

  const handleUpdateDatabase = useCallback(
    async (id: number, data: any) => {
      try {
        updateDatabase(id, data);
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
  );

  const handleRemoveDatabase = useCallback(
    (id: number, name: string) => {
      try {
        removeDatabase(id);
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
  );

  if (isLoading) {
    // Return optimistic UI instead of skeleton for smoother experience
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
      {/* Show creation form if isCreating is true */}
      {isCreating && (
        <ConnectionForm
          onSubmit={handleAddDatabase}
          onCancel={closeConnectionForm}
        />
      )}

      {/* Show edit form if editing a connection */}
      {editingConnectionId !== null && connectionBeingEdited && (
        <ConnectionForm
          onSubmit={(data) => handleUpdateDatabase(editingConnectionId, data)}
          onCancel={closeConnectionForm}
          defaultValues={connectionBeingEdited}
          isEditing={true}
        />
      )}

      <ConnectionsList
        connections={databases}
        currentConnectionId={currentDatabaseId}
        onUpdate={(id) => openEditConnectionForm(id)}
        onRemove={handleRemoveDatabase}
        onAddNew={openAddConnectionForm}
      />
    </div>
  );
});
