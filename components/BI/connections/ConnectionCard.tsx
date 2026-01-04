import { memo, useState } from "react";
import {
  Server,
  Trash2,
  Loader2,
  CheckCircle,
  ArrowRightCircle,
  MoreHorizontal,
  Edit,
  ServerOff,
  TableProperties,
} from "lucide-react";
import { SiPostgresql, SiMysql, SiSupabase, SiAmazon } from "react-icons/si";
import { useToast } from "@/lib/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { DatabaseConfig } from "@/lib/types/stores/dbConnections"; // Corrected path for DatabaseConfig
import { useDatabase } from "@/lib/hooks/use-database";
import { fetchDatabaseStructure } from "@/lib/hooks/query-helpers";
import { useQueryClient } from "@tanstack/react-query";
import { tableQueryKeys } from "@/lib/hooks/use-table-data";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"; // Added Tooltip imports
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"; // Added Dropdown imports
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";

interface ConnectionCardProps {
  connection: DatabaseConfig;
  isActive: boolean;
  onUpdate: (id: number) => void;
  onRemove: (id: number, name: string) => void;
}

// Helper function to determine database icon based on connection details
const getDatabaseIcon = (connection: DatabaseConfig) => {
  // Check connection type
  if (connection.type === "postgres") {
    // Check if it's a special service
    if (connection.connectionString?.includes("neon.tech")) {
      return (
        <div className="w-5 h-5 flex items-center justify-center">
          <Image
            src="/logos/neon-light.svg"
            alt="Neon Database"
            width={20}
            height={20}
            className="dark:hidden"
          />
          <Image
            src="/logos/neon-dark.svg"
            alt="Neon Database"
            width={20}
            height={20}
            className="hidden dark:block"
          />
        </div>
      );
    } else if (connection.connectionString?.includes("supabase")) {
      return <SiSupabase className="h-5 w-5 text-[#3ECF8E]" />;
    } else if (
      connection.connectionString?.includes("aws") ||
      connection.connectionString?.includes("rds")
    ) {
      return (
        <div className="w-5 h-5 flex items-center justify-center">
          <Image src="/logos/aws.svg" alt="AWS RDS" width={20} height={20} />
        </div>
      );
    }
    // Default PostgreSQL icon
    return <SiPostgresql className="h-5 w-5 text-[#336791]" />;
  } else if (connection.type === "mysql") {
    return <SiMysql className="h-5 w-5 text-[#00758F]" />;
  }

  // Fallback database icon
  return <Server className="h-5 w-5" />;
};

export const ConnectionCard = memo(function ConnectionCard({
  connection,
  isActive,
  onUpdate,
  onRemove,
}: ConnectionCardProps) {
  const [activating, setActivating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  const { setCurrentDatabase } = useDatabase();
  const queryClient = useQueryClient();

  const handleSetActive = async () => {
    if (isActive) return;
    setActivating(true);

    try {
      // Fetch structure first to test connection and prime cache
      await fetchDatabaseStructure(
        connection.connectionString,
        connection.type
      );
      // Invalidate queries instead of clearing table data
      await queryClient.invalidateQueries({
        queryKey: tableQueryKeys.databaseStructure(),
      });
      await queryClient.invalidateQueries({
        queryKey: tableQueryKeys.tableData(), // Invalidate table data as well
      });
      await setCurrentDatabase(connection.id);
      toast({
        title: "Database activated",
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
  const DatabaseIcon = getDatabaseIcon(connection);

  return (
    <>
      <Card
        className={`transition-all border ${
          isActive
            ? "border-primary/50 bg-primary/[0.03] shadow-sm"
            : "hover:border-muted-foreground/20 hover:shadow-xs"
        }`}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div
                className={`shrink-0 p-1.5 rounded-md ${
                  isActive ? "bg-primary/10" : "bg-muted"
                }`}
              >
                {DatabaseIcon}
              </div>
              <div className="min-w-0 flex-1">
                <TooltipProvider delayDuration={300}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <h3 className="font-medium truncate text-sm">
                        {connection.name}
                      </h3>
                    </TooltipTrigger>
                    <TooltipContent side="top" align="start">
                      {connection.name}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                  <Server className="h-3 w-3 opacity-70" />
                  {dbTypeLabel}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {isActive && (
                <Link href="/connections/schema" passHref>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 gap-1 text-xs"
                  >
                    <TableProperties className="h-3 w-3" />
                    Schema
                  </Button>
                </Link>
              )}
              <Button
                variant={isActive ? "secondary" : "default"}
                size="sm"
                className={`h-7 transition-all ${
                  isActive ? "pointer-events-none opacity-90" : ""
                }`}
                disabled={activating}
                onClick={handleSetActive}
              >
                {activating ? (
                  <Loader2 className="h-3 w-3 animate-spin mr-1" />
                ) : isActive ? (
                  <CheckCircle className="h-3 w-3 mr-1" />
                ) : (
                  <ArrowRightCircle className="h-3 w-3 mr-1" />
                )}
                {isActive ? "Active" : "Connect"}
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 rounded-md"
                  >
                    <MoreHorizontal className="h-3.5 w-3.5" />
                    <span className="sr-only">Actions</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuItem
                    onClick={() => onUpdate(connection.id)}
                    className="cursor-pointer"
                  >
                    <Edit className="mr-2 h-3.5 w-3.5" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive cursor-pointer"
                    onClick={() => setIsDeleting(true)}
                  >
                    <Trash2 className="mr-2 h-3.5 w-3.5" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>

        <CardFooter
          className={`px-4 py-2 bg-muted/30 text-xs text-muted-foreground font-mono border-t ${
            isActive ? "border-primary/20" : "border-border"
          } flex items-center gap-1.5`}
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
                    {formatConnectionString(connection.connectionString)}
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent
                side="top"
                align="start"
                className="max-w-md font-mono"
              >
                {formatConnectionString(connection.connectionString, 1000)}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardFooter>
      </Card>

      <AlertDialog open={isDeleting} onOpenChange={setIsDeleting}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Connection</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{connection.name}"? This action
              cannot be undone.
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
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
});

// Improved helper function to format connection strings for display
function formatConnectionString(
  connectionString: string,
  maxLength: number = 90
): string {
  if (!connectionString) return "No connection string";

  // Special case for default test database - mask password
  if (connectionString === process.env.NEXT_PUBLIC_DEFAULT_DB_CONNECTION_STRING) {
    try {
      const url = new URL(connectionString);
      return truncateString(
        `${url.protocol}//${url.username}:******@${url.host}${url.pathname}`,
        maxLength
      );
    } catch {
      // Fallback if URL parsing fails
      return truncateString(
        connectionString.replace(/:[^:\/]+@/, ":******@"),
        maxLength
      );
    }
  }

  try {
    const url = new URL(connectionString);
    return truncateString(
      `${url.protocol}//${url.hostname}:${url.port || "default"}${
        url.pathname
      }`,
      maxLength
    );
  } catch {
    // Fallback: hide password in non-URL string format
    if (connectionString.includes("@")) {
      return truncateString(
        connectionString.replace(/:[^:\/]+@/, ":*****@"),
        maxLength
      );
    }

    // Simple string truncation for non-URL formats
    return connectionString.length > 20
      ? truncateString(
          connectionString.substring(0, 8) +
            "..." +
            connectionString.substring(connectionString.length - 8)
        )
      : connectionString;
  }
}

// Utility function to truncate strings
function truncateString(str: string, maxLength: number = 90): string {
  return str.length > maxLength ? str.substring(0, maxLength) + "..." : str;
}
