import { DatabaseConfig } from "@/lib/types/stores/dbConnections";
import { ConnectionCard } from "./ConnectionCard";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { memo, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Database, Loader2, PlusCircle } from "lucide-react";

interface ConnectionsListProps {
  connections: DatabaseConfig[];
  currentConnectionId: number | null;
  onUpdate: (id: number) => void;
  onRemove: (id: number, name: string) => void;
  onAddNew: () => void;
  isLoading?: boolean;
}

export const ConnectionsList = memo(function ConnectionsList({
  connections,
  currentConnectionId,
  onUpdate,
  onRemove,
  onAddNew,
  isLoading = false,
}: ConnectionsListProps) {
  // Sort connections: active one first, then alphabetically by name
  const sortedConnections = useMemo(
    () =>
      [...connections].sort((a, b) => {
        if (a.id === currentConnectionId) return -1;
        if (b.id === currentConnectionId) return 1;
        return a.name.localeCompare(b.name);
      }),
    [connections, currentConnectionId]
  );

  if (isLoading) {
    return <LoadingState />;
  }

  if (connections.length === 0) {
    return <EmptyConnectionsList onAddNew={onAddNew} />;
  }

  return (
    <div className="flex-1 overflow-hidden flex flex-col">
      <div className="text-sm font-medium text-muted-foreground mb-3 flex items-center justify-between">
        <div>
          {connections.length}{" "}
          {connections.length === 1 ? "connection" : "connections"}
        </div>
      </div>

      <ScrollArea className="flex-1 pr-4">
        <div className="grid gap-3 pb-6">
          <AnimatePresence initial={false}>
            {sortedConnections.map((connection) => (
              <motion.div
                key={connection.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                transition={{ duration: 0.2 }}
                layout="position"
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
    </div>
  );
});

// Empty state component
function EmptyConnectionsList({ onAddNew }: { onAddNew: () => void }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border border-dashed rounded-lg bg-background/50">
      <div className="mb-5 p-4 rounded-full bg-primary/10">
        <Database className="h-6 w-6 text-primary" />
      </div>
      <h3 className="font-medium mb-2 text-lg">No connections yet</h3>
      <p className="text-sm text-muted-foreground mb-6 max-w-md">
        Connect to your databases to explore and visualize data
      </p>
      <Button onClick={onAddNew} className="gap-2">
        <PlusCircle className="h-4 w-4" />
        Add Connection
      </Button>
    </div>
  );
}

// Loading state component
function LoadingState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
      <div className="mb-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary/70" />
      </div>
      <p className="text-sm text-muted-foreground">Loading connections...</p>
    </div>
  );
}
