"use client";

import { useDbStore } from "../../stores/db_mongo_client";
import { DatabaseCard } from "./DatabaseCard";
import { DatabaseDialog } from "./DatabaseDialog";
import { useEffect, useState, memo, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Database, Loader2, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

export const DatabasesForm = memo(function DatabasesForm() {
  const {
    databases,
    addDatabase,
    removeDatabase,
    updateDatabase,
    currentDatabaseId,
    loadDatabases,
  } = useDbStore();
  const [isLoading, setIsLoading] = useState(true);

  // Load databases on component mount
  useEffect(() => {
    loadDatabases()
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [loadDatabases]);

  // Sort databases: active one first, then alphabetically
  const sortedDatabases = useMemo(
    () =>
      [...databases].sort((a, b) => {
        if (a.id === currentDatabaseId) return -1;
        if (b.id === currentDatabaseId) return 1;
        return a.name.localeCompare(b.name);
      }),
    [databases, currentDatabaseId]
  );

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="h-6 w-6 animate-spin text-primary/70" />
      </div>
    );
  }

  // Empty state
  if (databases.length === 0) {
    return (
      <div className="border border-dashed rounded-lg bg-background/50 p-6 text-center">
        <div className="mb-3 mx-auto w-12 h-12 flex items-center justify-center rounded-full bg-primary/10">
          <Database className="h-5 w-5 text-primary" />
        </div>
        <h3 className="text-base font-medium mb-1">No connections yet</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Connect to your databases to explore and visualize data
        </p>
        <DatabaseDialog
          onSubmit={addDatabase}
          trigger={
            <Button size="sm" className="gap-2">
              <PlusCircle className="h-3.5 w-3.5" />
              Add Database
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Database Connections</h2>
        <DatabaseDialog
          onSubmit={addDatabase}
          trigger={
            <Button size="sm" className="gap-1.5">
              <PlusCircle className="h-3.5 w-3.5" />
              Add Database
            </Button>
          }
        />
      </div>

      <div className="text-sm text-muted-foreground">
        {databases.length}{" "}
        {databases.length === 1 ? "connection" : "connections"}
      </div>

      <ScrollArea className="h-[calc(100vh-260px)] pr-3">
        <div className="grid gap-2.5 pb-4">
          <AnimatePresence initial={false}>
            {sortedDatabases.map((db) => (
              <motion.div
                key={db.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                transition={{ duration: 0.2 }}
                layout="position"
              >
                <DatabaseCard
                  db={db}
                  onEdit={(id, config) => updateDatabase(id, config)}
                  onDelete={(id) => removeDatabase(id)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </ScrollArea>
    </div>
  );
});
