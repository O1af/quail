"use client";

import * as React from "react";
import { ChevronsUpDown, Database } from "lucide-react";
import { useDbStore } from "@/components/stores/db_store";
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
        <SidebarMenuButton
          onClick={() => {
            const event = new CustomEvent("openSettings", {
              detail: { section: "database" },
            });
            window.dispatchEvent(event);
          }}
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
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
