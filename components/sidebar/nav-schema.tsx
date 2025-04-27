"use client";

import { useEffect, useState } from "react";
import {
  ChevronRight,
  Database,
  Table2,
  BoxSelect,
  RefreshCw,
} from "lucide-react";
import { useToast } from "@/lib/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import {
  useDatabaseStructure,
  tableQueryKeys,
} from "@/lib/hooks/use-table-data";
import { useDatabase } from "@/lib/hooks/use-database";
import { useEditorStore } from "@/components/stores/editor_store";

export function NavSchema() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);
  const { getCurrentDatabase, isLoading: dbLoading } = useDatabase();
  const {
    data: databaseStructure = { schemas: [] },
    refetch,
    isLoading: structureLoading,
    isFetching,
  } = useDatabaseStructure();
  const executeQuery = useEditorStore((state) => state.executeQuery);
  const setValue = useEditorStore((state) => state.setValue);

  const isLoading = dbLoading || structureLoading || isFetching || refreshing;

  useEffect(() => {
    if (!dbLoading) {
      const currentDb = getCurrentDatabase();
      if (currentDb && !databaseStructure.schemas.length) {
      }
    }
  }, [dbLoading, getCurrentDatabase, databaseStructure.schemas.length]);

  const handleRefresh = async () => {
    const currentDb = getCurrentDatabase();
    if (isLoading || !currentDb) return;

    setRefreshing(true);
    try {
      await queryClient.invalidateQueries({
        queryKey: tableQueryKeys.databaseStructure(),
      });
      toast({
        title: "Schema refreshed",
        description: "Database schema has been updated.",
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Refresh failed",
        description:
          err instanceof Error
            ? err.message
            : "Failed to refresh database schema",
      });
    } finally {
      setRefreshing(false);
    }
  };

  const handleTableClick = async (schemaName: string, tableName: string) => {
    const currentDb = getCurrentDatabase();
    if (!currentDb) return;
    let query: string;
    if (currentDb.type === "postgres") {
      query = `SELECT * FROM "${schemaName}"."${tableName}" LIMIT 100;`;
    } else if (currentDb.type === "mysql") {
      query = `SELECT * FROM ${schemaName}.${tableName} LIMIT 100;`;
    } else {
      toast({
        variant: "destructive",
        title: "Unsupported Database",
        description: `Database type '${currentDb.type}' is not supported for table preview.`,
      });
      return;
    }
    try {
      setValue(query);
      await executeQuery();
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Query failed",
        description:
          err instanceof Error ? err.message : "Failed to query table",
      });
    }
  };

  return (
    <SidebarGroup className="flex flex-col grow h-full">
      <SidebarGroupLabel className="flex justify-between items-center mb-1">
        <div className="flex items-center gap-1.5">
          <Database className="h-3.5 w-3.5 text-muted-foreground" />
          <span>Database Schemas</span>
        </div>
        {getCurrentDatabase() && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={handleRefresh}
                  className="p-1 hover:bg-accent hover:text-accent-foreground rounded-md transition-colors"
                  disabled={isLoading}
                >
                  <RefreshCw
                    className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`}
                  />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Refresh Database Schemas</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </SidebarGroupLabel>
      <SidebarMenu className="grow overflow-y-auto pr-1">
        {isLoading && databaseStructure.schemas.length === 0 && (
          <div className="p-4 text-center text-muted-foreground">
            Loading schema...
          </div>
        )}
        {!isLoading &&
          databaseStructure.schemas.length === 0 &&
          getCurrentDatabase() && (
            <div className="p-4 text-center text-muted-foreground">
              No schemas found or empty database. Try refreshing.
            </div>
          )}
        {!isLoading && !getCurrentDatabase() && (
          <div className="p-4 text-center text-muted-foreground">
            Select a database connection first.
          </div>
        )}
        {databaseStructure.schemas.map((schema) => (
          <Collapsible
            key={schema.name}
            asChild
            className="group/collapsible mb-0.5"
          >
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton
                  tooltip={schema.name}
                  className="rounded-md hover:bg-muted transition-colors duration-150 px-2 py-1.5"
                >
                  <Database className="h-4 w-4 text-primary" />
                  <span className="font-medium">{schema.name}</span>
                  <ChevronRight className="ml-auto h-4 w-4 text-muted-foreground transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub>
                  {schema.tables.map((table) => (
                    <SidebarMenuSubItem
                      key={table.name}
                      onClick={() => handleTableClick(schema.name, table.name)}
                      className="cursor-pointer"
                    >
                      <SidebarMenuSubButton className="rounded-md hover:bg-muted hover:text-foreground transition-colors duration-150 pl-6 py-1">
                        {table.type.toLowerCase().includes("view") ? (
                          <BoxSelect className="h-3.5 w-3.5 mr-1.5 text-indigo-500" />
                        ) : (
                          <Table2 className="h-3.5 w-3.5 mr-1.5 text-blue-500" />
                        )}
                        <span className="text-sm truncate">{table.name}</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ))}
                  {schema.tables.length === 0 && (
                    <SidebarMenuSubItem className="pl-6 py-1">
                      <span className="text-xs text-muted-foreground italic">
                        No tables found
                      </span>
                    </SidebarMenuSubItem>
                  )}
                </SidebarMenuSub>
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
