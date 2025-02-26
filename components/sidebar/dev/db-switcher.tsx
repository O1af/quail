"use client";

import * as React from "react";
import { ChevronsUpDown, Database } from "lucide-react";
import { SiPostgresql, SiMysql } from "react-icons/si";
import { useDbStore } from "@/components/stores/db_store";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const getDatabaseIcon = (type?: string) => {
  switch (type?.toLowerCase()) {
    case "postgres":
      return <SiPostgresql className="size-4 text-blue-400" />;
    case "mysql":
      return <SiMysql className="size-4 text-orange-500" />;
    default:
      return <Database className="size-4 text-gray-400" />;
  }
};

export function TeamSwitcher() {
  const databases = useDbStore((state) => state.databases);
  const currentDatabaseId = useDbStore((state) => state.currentDatabaseId);

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
          <div className="flex aspect-square size-9 items-center justify-center rounded-lg bg-sidebar-accent/20 ring-1 ring-sidebar-accent/30 transition-colors group-hover:bg-sidebar-accent/30">
            {getDatabaseIcon(currentDatabase?.type)}
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
