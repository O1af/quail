"use client";

import {
  ChevronRight,
  Database,
  Table2,
  BoxSelect,
  RefreshCw,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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

import { useDatabaseStructure } from "../stores/table_store";
import { queryMetadata, handleQuery } from "../stores/utils/query";
import { useState } from "react";
import { useDbStore } from "../stores/db_store";
import { match } from "assert";
export function NavSchema() {
  const { toast } = useToast();
  const [refreshing, setRefreshing] = useState(false);
  const getCurrentDatabase = useDbStore((state) => state.getCurrentDatabase);
  const databaseStructure = useDatabaseStructure();

  const handleRefresh = async () => {
    const currentDb = getCurrentDatabase();
    if (refreshing || !currentDb) return;

    setRefreshing(true);
    try {
      await queryMetadata(currentDb.connectionString, currentDb.type);
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
      throw new Error(`Unsupported database type: ${currentDb.type}`);
    }
    try {
      await handleQuery(query);
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
    <SidebarGroup className="h-full">
      <SidebarGroupLabel>
        Database Schemas
        {getCurrentDatabase() && (
          <TooltipProvider>
            <div className="absolute top-2 right-2 flex space-x-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={handleRefresh}
                    className="p-1 hover:bg-accent rounded-sm"
                    disabled={refreshing}
                  >
                    <RefreshCw
                      className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
                    />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Refresh Database Schemas</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>
        )}
      </SidebarGroupLabel>
      <SidebarMenu className="h-[calc(100%-2rem)] overflow-y-auto">
        {databaseStructure.schemas.map((schema) => (
          <Collapsible key={schema.name} asChild className="group/collapsible">
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton tooltip={schema.name}>
                  <Database className="h-4 w-4" />
                  <span>{schema.name}</span>
                  <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub>
                  {schema.tables.map((table) => (
                    <SidebarMenuSubItem
                      key={table.name}
                      onClick={() => handleTableClick(schema.name, table.name)}
                    >
                      <SidebarMenuSubButton>
                        {table.type === "VIEW" ? (
                          <BoxSelect className="h-4 w-4" />
                        ) : (
                          <Table2 className="h-4 w-4" />
                        )}
                        <span>{table.name}</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub>
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
