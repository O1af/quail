"use client";

import { useState, useCallback, memo, useEffect } from "react";
import { useDbStore } from "@/components/stores/db_mongo_client";
import { ConnectionsList } from "./ConnectionsList";
import { ConnectionForm } from "./ConnectionForm";
import { useToast } from "@/lib/hooks/use-toast";
import { useConnectionsState } from "@/lib/hooks/useConnectionsState";
import { AnimatePresence, motion } from "framer-motion";

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

  // Database operations with error handling
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

  const formVisible = isCreating || editingConnectionId !== null;

  return (
    <div className="flex flex-col h-full overflow-hidden px-6 py-4">
      <AnimatePresence mode="wait">
        {formVisible && (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="mb-5"
          >
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
          </motion.div>
        )}
      </AnimatePresence>

      <ConnectionsList
        connections={databases}
        currentConnectionId={currentDatabaseId}
        onUpdate={openEditConnectionForm}
        onRemove={databaseOperations.remove}
        onAddNew={openAddConnectionForm}
        isLoading={isDbLoading}
      />
    </div>
  );
});
