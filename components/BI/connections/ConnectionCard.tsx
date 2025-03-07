import { useState, memo } from "react";
import { DatabaseConfig, useDbStore } from "@/components/stores/db_store";
import { queryMetadata } from "@/components/stores/utils/query";
import { useTableStore } from "@/components/stores/table_store";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  MoreHorizontal,
  Edit,
  Trash2,
  CheckCircle,
  Database,
  ArrowRightCircle,
  Loader2,
  AlertCircle,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

interface ConnectionCardProps {
  connection: DatabaseConfig;
  isActive: boolean;
  onUpdate: (id: number) => void;
  onRemove: (id: number, name: string) => void;
}

export const ConnectionCard = memo(function ConnectionCard({
  connection,
  isActive,
  onUpdate,
  onRemove,
}: ConnectionCardProps) {
  const [activating, setActivating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  const { setCurrentDatabase } = useDbStore();
  const clearTableData = useTableStore((state) => state.clearTableData);

  const handleSetActive = async () => {
    if (isActive) return;
    setActivating(true);

    try {
      await queryMetadata(connection.connectionString, connection.type);
      clearTableData();
      setCurrentDatabase(connection.id);
      toast({
        title: "Connection activated",
        description: `Now using ${connection.name} as the active database.`,
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

  const dbTypeLabel = connection.type === "postgres" ? "PostgreSQL" : "MySQL";

  return (
    <>
      <Card
        className={`transition-all ${
          isActive
            ? "border-primary bg-primary/5 shadow-sm"
            : "hover:border-muted-foreground/20"
        }`}
      >
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-full ${
                  isActive ? "bg-primary/20" : "bg-muted"
                }`}
              >
                <Database
                  className={`h-5 w-5 ${
                    isActive ? "text-primary" : "text-muted-foreground"
                  }`}
                />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <h3 className="font-medium">{connection.name}</h3>
                  {isActive && (
                    <Badge className="bg-primary/10 text-primary border-primary/20">
                      Active
                    </Badge>
                  )}
                </div>
                <CardDescription>{dbTypeLabel} database</CardDescription>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={isActive ? "secondary" : "outline"}
                      size="sm"
                      className="gap-1"
                      disabled={activating || isActive}
                      onClick={handleSetActive}
                    >
                      {activating ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                      ) : isActive ? (
                        <CheckCircle className="h-3.5 w-3.5 mr-1" />
                      ) : (
                        <ArrowRightCircle className="h-3.5 w-3.5 mr-1" />
                      )}
                      {activating
                        ? "Connecting"
                        : isActive
                        ? "Active"
                        : "Activate"}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {isActive
                      ? "Current active database"
                      : "Set as active database"}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <DropdownMenu>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                    </TooltipTrigger>
                    <TooltipContent>Options</TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onUpdate(connection.id)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit connection
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => setIsDeleting(true)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete connection
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
        <CardFooter
          className={`px-6 py-3 bg-muted/40 text-xs text-muted-foreground font-mono border-t ${
            isActive ? "border-primary/20" : "border-border"
          }`}
        >
          {hideConnectionString(connection.connectionString)}
        </CardFooter>
      </Card>

      <AlertDialog open={isDeleting} onOpenChange={setIsDeleting}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Connection</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the connection "{connection.name}
              "? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onRemove(connection.id, connection.name);
                setIsDeleting(false);
              }}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete Connection
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
});

// Helper function to hide sensitive connection string details
function hideConnectionString(connectionString: string): string {
  try {
    const url = new URL(connectionString);
    return `${url.protocol}//${url.hostname}:${url.port || "default"}${
      url.pathname
    }`;
  } catch {
    return connectionString.replace(/:[^:\/]+@/, ":*****@");
  }
}
