import { DatabaseConfig } from "@/lib/types/stores/dbConnections";
import { ConnectionCard } from "./ConnectionCard";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { memo, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PlusCircle } from "lucide-react";

interface ConnectionsListProps {
  connections: DatabaseConfig[];
  currentConnectionId: number | null;
  onUpdate: (id: number) => void;
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
  const sortedConnections = useMemo(
    () =>
      [...connections].sort((a, b) => {
        if (a.id === currentConnectionId) return -1;
        if (b.id === currentConnectionId) return 1;
        return a.name.localeCompare(b.name);
      }),
    [connections, currentConnectionId]
  );

  if (connections.length === 0) {
    return <EmptyConnectionsList onAddNew={onAddNew} />;
  }

  return (
    <div className="flex flex-col gap-4">
      <ScrollArea className="h-[calc(100vh-300px)] pr-4 w-full">
        <div className="grid gap-4 pb-4 w-full">
          <AnimatePresence>
            {sortedConnections.map((connection) => (
              <motion.div
                key={connection.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0, overflow: "hidden" }}
                transition={{ duration: 0.2 }}
                layout
                className="w-full"
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
