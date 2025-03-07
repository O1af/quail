import { DatabaseConfig } from "@/components/stores/db_store";
import { ConnectionCard } from "./ConnectionCard";
import { ScrollArea } from "@/components/ui/scroll-area";
import { memo, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ConnectionsListProps {
  connections: DatabaseConfig[];
  currentConnectionId: number | null;
  onUpdate: (id: number) => void; // Changed to match ConnectionCard's onUpdate type
  onRemove: (id: number, name: string) => void;
  onAddNew: () => void;
}

export const ConnectionsList = memo(function ConnectionsList({
  connections,
  currentConnectionId,
  onUpdate,
  onRemove,
  onAddNew,
}: ConnectionsListProps) {
  // Sort connections: active one first, then alphabetically by name
  const sortedConnections = useMemo(() => {
    return [...connections].sort((a, b) => {
      if (a.id === currentConnectionId) return -1;
      if (b.id === currentConnectionId) return 1;
      return a.name.localeCompare(b.name);
    });
  }, [connections, currentConnectionId]);

  if (connections.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-12 border border-dashed rounded-lg bg-background/50 h-[300px]">
        <div className="mb-4 p-3 rounded-full bg-primary/10">
          <PlusCircle className="h-6 w-6 text-primary" />
        </div>
        <h3 className="font-medium mb-2 text-lg">No connections yet</h3>
        <p className="text-sm text-muted-foreground mb-4 max-w-md">
          Add your first database connection to get started exploring your data.
        </p>
        <Button onClick={onAddNew} className="gap-2">
          <PlusCircle className="h-4 w-4" />
          Add Connection
        </Button>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[calc(100vh-300px)] pr-4">
      <div className="grid gap-4">
        <AnimatePresence>
          {sortedConnections.map((connection) => (
            <motion.div
              key={connection.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0, overflow: "hidden" }}
              transition={{ duration: 0.2 }}
              layout
            >
              <ConnectionCard
                connection={connection}
                isActive={connection.id === currentConnectionId}
                onUpdate={onUpdate}
                onRemove={onRemove}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ScrollArea>
  );
});
