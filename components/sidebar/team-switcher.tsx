"use client";

import * as React from "react";
import { ChevronsUpDown, Plus, Database } from "lucide-react";
import { useDbStore } from "@/components/stores/db_store";
import { DatabaseDialog } from "./database-dialog";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

export function TeamSwitcher() {
  const { isMobile } = useSidebar();
  const databases = useDbStore((state) => state.databases);
  const currentDatabaseId = useDbStore((state) => state.currentDatabaseId);
  const setCurrentDatabase = useDbStore((state) => state.setCurrentDatabase);

  const currentDatabase = databases.find((db) => db.id === currentDatabaseId);

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <Database className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  {currentDatabase?.name || "Select Database"}
                </span>
                <span className="truncate text-xs">
                  {currentDatabase?.type || "No database selected"}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Databases
            </DropdownMenuLabel>
            {databases.map((database) => (
              <DropdownMenuItem
                key={database.id}
                onClick={() => setCurrentDatabase(database.id)}
                className="gap-2 p-2"
              >
                <div className="flex size-6 items-center justify-center rounded-sm border">
                  <Database className="size-4 shrink-0" />
                </div>
                {database.name}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DatabaseDialog
              trigger={
                <DropdownMenuItem
                  className="gap-2 p-2"
                  onSelect={(e) => {
                    e.preventDefault();
                  }}
                >
                  <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                    <Plus className="size-4" />
                  </div>
                  <div className="font-medium text-muted-foreground">
                    Add database
                  </div>
                </DropdownMenuItem>
              }
            />
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
