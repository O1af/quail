"use client";

import * as React from "react";
import { ChevronsUpDown, Database, Loader2 } from "lucide-react";
import { SiPostgresql, SiMysql } from "react-icons/si";
import { useDatabase } from "@/lib/hooks/use-database";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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

export function DbHeaderSwitcher() {
  const { databases, currentDatabaseId, isLoading } = useDatabase();

  const currentDatabase = databases.find((db) => db.id === currentDatabaseId);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="h-9 gap-2 border-dashed"
            onClick={() => {
              const event = new CustomEvent("openSettings", {
                detail: { section: "connections" },
              });
              window.dispatchEvent(event);
            }}
          >
            {isLoading ? (
              <Loader2 className="size-4 text-muted-foreground animate-spin" />
            ) : (
              getDatabaseIcon(currentDatabase?.type)
            )}
            <span className="truncate max-w-[150px]">
              {isLoading
                ? "Loading..."
                : currentDatabase?.name || "Select Database"}
            </span>
            <ChevronsUpDown className="size-4 text-muted-foreground" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>
            {isLoading
              ? "Loading database..."
              : currentDatabase
              ? `Database: ${currentDatabase.name} (${currentDatabase.type})`
              : "Click to select database"}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
