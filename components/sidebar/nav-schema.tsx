"use client";

import { ChevronRight, Database, Table2, BoxSelect } from "lucide-react";

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
import { useDatabaseStructure } from "../stores/table_store";

export function NavSchema() {
  const databaseStructure = useDatabaseStructure();

  return (
    <SidebarGroup className="h-full">
      <SidebarGroupLabel>Database Schemas</SidebarGroupLabel>
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
                    <SidebarMenuSubItem key={table.name}>
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
