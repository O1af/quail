"use client";

import { useDbStore } from "@/components/stores/db_store";
import { ConnectionsList } from "./ConnectionsList";
import { ConnectionForm } from "./ConnectionForm";
import { useState, useCallback, memo, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export const Connections = memo(function Connections() {
  const {
    databases,
    addDatabase,
    removeDatabase,
    updateDatabase,
    currentDatabaseId,
  } = useDbStore();

  const [isCreating, setIsCreating] = useState(false);
  const [editingConnectionId, setEditingConnectionId] = useState<number | null>(
    null
  );
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);

  // Handle external "Add Connection" button trigger
  useEffect(() => {
    const handleAddConnection = () => {
      setIsCreating(true);
      setEditingConnectionId(null);
    };

    const addButton = document.getElementById("add-connection-trigger");
    if (addButton) {
      addButton.addEventListener("click", handleAddConnection);
    }

    // Simulate loading for better UX
    const timer = setTimeout(() => setIsLoading(false), 500);

    return () => {
      if (addButton) {
        addButton.removeEventListener("click", handleAddConnection);
      }
      clearTimeout(timer);
    };
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
        setIsCreating(false);
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
    [addDatabase, toast]
  );

  const handleUpdateDatabase = useCallback(
    async (id: number, data: any) => {
      try {
        updateDatabase(id, data);
        setEditingConnectionId(null);
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
    [updateDatabase, toast]
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

  const cancelEditing = () => {
    setIsCreating(false);
    setEditingConnectionId(null);
  };

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
        <ConnectionForm onSubmit={handleAddDatabase} onCancel={cancelEditing} />
      )}

      {/* Show edit form if editing a connection */}
      {editingConnectionId !== null && connectionBeingEdited && (
        <ConnectionForm
          onSubmit={(data) => handleUpdateDatabase(editingConnectionId, data)}
          onCancel={cancelEditing}
          defaultValues={connectionBeingEdited}
          isEditing={true}
        />
      )}

      <ConnectionsList
        connections={databases}
        currentConnectionId={currentDatabaseId}
        onUpdate={(id) => {
          setEditingConnectionId(id);
          setIsCreating(false);
        }}
        onRemove={handleRemoveDatabase}
        onAddNew={() => {
          setIsCreating(true);
          setEditingConnectionId(null);
        }}
      />
    </div>
  );
});
