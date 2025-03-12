import { DatabaseConfig, useDbStore } from "../../stores/db_mongo_client";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, CheckCircle, Circle, Loader2 } from "lucide-react";
import { DatabaseDialog } from "./DatabaseDialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useState, memo } from "react";
import { useToast } from "@/lib/hooks/use-toast";
import { queryMetadata } from "../../stores/utils/query";
import { useTableStore } from "../../stores/table_store"; // Add this import

interface DatabaseCardProps {
  db: DatabaseConfig;
  onEdit: (id: number, data: any) => void;
  onDelete: (id: number) => void;
}

export const DatabaseCard = memo(function DatabaseCard({
  db,
  onEdit,
  onDelete,
}: DatabaseCardProps) {
  const [activating, setActivating] = useState(false);
  const { toast } = useToast();
  const { currentDatabaseId, setCurrentDatabase } = useDbStore();
  const isActive = db.id === currentDatabaseId;
  const clearTableData = useTableStore((state) => state.clearTableData);

  const handleSetActive = async () => {
    if (isActive) return;
    setActivating(true);
    try {
      await queryMetadata(db.connectionString, db.type);
      clearTableData(); // Clear table data before switching database
      setCurrentDatabase(db.id);
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Connection failed",
        description:
          err instanceof Error ? err.message : "Failed to connect to database",
      });
    } finally {
      setActivating(false);
    }
  };

  return (
    <div
      className={`flex items-center justify-between rounded-lg border p-4 hover:bg-muted/50 transition-colors ${
        isActive ? "border-primary/50 bg-primary/5" : "border-border"
      }`}
    >
      <div className="flex flex-col gap-0.5">
        <div className="flex items-center gap-2">
          <span className="font-medium">{db.name}</span>
          {isActive && (
            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">
              Active
            </span>
          )}
        </div>
        <span className="text-xs text-muted-foreground">{db.type}</span>
      </div>
      <div className="flex gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <DatabaseDialog
              defaultValues={db}
              onSubmit={(values) => onEdit(db.id, values)}
              trigger={
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Pencil className="w-4 h-4" />
                </Button>
              }
            />
          </TooltipTrigger>
          <TooltipContent>Edit database</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onDelete(db.id)}
            >
              <Trash2 className="w-4 h-4 text-destructive" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Delete database</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleSetActive}
              disabled={activating || isActive}
            >
              {activating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : isActive ? (
                <CheckCircle className="w-4 h-4 text-primary" />
              ) : (
                <Circle className="w-4 h-4" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {isActive
              ? "Current database"
              : activating
              ? "Testing connection..."
              : "Set as current"}
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
});
