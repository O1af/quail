import { DatabaseConfig, useDbStore } from "../../stores/db_mongo_client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useState, memo } from "react";
import { useToast } from "@/lib/hooks/use-toast";
import { queryMetadata } from "../../stores/utils/query";
import { useTableStore } from "../../stores/table_store";
import {
  CheckCircle,
  ArrowRightCircle,
  Loader2,
  ServerOff,
  Edit,
  Trash2,
  Server,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { SiPostgresql, SiMysql } from "react-icons/si";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { DatabaseDialog } from "./DatabaseDialog";

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
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  const { currentDatabaseId, setCurrentDatabase } = useDbStore();
  const clearTableData = useTableStore((state) => state.clearTableData);
  const isActive = db.id === currentDatabaseId;

  const handleSetActive = async () => {
    if (isActive) return;
    setActivating(true);

    try {
      await queryMetadata(db.connectionString, db.type);
      clearTableData();
      setCurrentDatabase(db.id);
      toast({
        title: "Database activated",
        description: `Now using ${db.name} as the active database.`,
      });
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

  // Get database icon based on type
  const DatabaseIcon =
    db.type === "postgres" ? (
      <SiPostgresql className="h-4 w-4 text-[#336791]" />
    ) : (
      <SiMysql className="h-4 w-4 text-[#00758F]" />
    );

  // Format connection string for display
  const formatConnectionString = (connectionString: string): string => {
    try {
      const url = new URL(connectionString);
      return `${url.protocol}//${url.hostname}:${url.port || "default"}${
        url.pathname
      }`;
    } catch {
      // Fallback: hide password if possible
      if (connectionString.includes("@")) {
        return connectionString.replace(/:[^:\/]+@/, ":*****@");
      }
      return connectionString;
    }
  };

  return (
    <>
      <Card
        className={`border ${
          isActive
            ? "border-primary/50 bg-primary/[0.03] shadow-sm"
            : "hover:border-muted-foreground/20"
        }`}
      >
        <CardContent className="p-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div
                className={`shrink-0 p-1.5 rounded-md ${
                  isActive ? "bg-primary/10" : "bg-muted"
                }`}
              >
                {DatabaseIcon}
              </div>

              <div className="min-w-0">
                <TooltipProvider delayDuration={300}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <h3 className="font-medium truncate text-sm">
                        {db.name}
                      </h3>
                    </TooltipTrigger>
                    <TooltipContent side="top" align="start">
                      {db.name}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                  <Server className="h-3 w-3 opacity-70" />
                  {db.type === "postgres" ? "PostgreSQL" : "MySQL"}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <Button
                variant={isActive ? "secondary" : "default"}
                size="sm"
                className="h-7 text-xs"
                disabled={activating || isActive}
                onClick={handleSetActive}
              >
                {activating ? (
                  <Loader2 className="h-3 w-3 animate-spin mr-1" />
                ) : isActive ? (
                  <CheckCircle className="h-3 w-3 mr-1" />
                ) : (
                  <ArrowRightCircle className="h-3 w-3 mr-1" />
                )}
                {isActive ? "Active" : "Use"}
              </Button>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DatabaseDialog
                      defaultValues={db}
                      onSubmit={(values) => onEdit(db.id, values)}
                      trigger={
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                        >
                          <Edit className="h-3.5 w-3.5" />
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
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={() => setIsDeleting(true)}
                    >
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Delete database</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </CardContent>

        <CardFooter
          className={`px-3 py-1.5 bg-muted/30 text-xs text-muted-foreground font-mono border-t ${
            isActive ? "border-primary/20" : "border-border"
          }`}
        >
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="truncate flex items-center gap-1.5">
                  {isActive ? (
                    <CheckCircle className="h-3 w-3 text-primary/70 shrink-0" />
                  ) : (
                    <ServerOff className="h-3 w-3 opacity-50 shrink-0" />
                  )}
                  <span className="truncate">
                    {formatConnectionString(db.connectionString)}
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" align="start" className="font-mono">
                {formatConnectionString(db.connectionString)}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardFooter>
      </Card>

      <AlertDialog open={isDeleting} onOpenChange={setIsDeleting}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Database</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{db.name}"? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onDelete(db.id);
                setIsDeleting(false);
              }}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
});
