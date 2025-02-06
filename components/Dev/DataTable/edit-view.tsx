"use client";

import * as React from "react";
import { Table } from "@tanstack/react-table";
import { Check, ChevronsUpDown, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTableStore } from "@/components/stores/table_store";

interface DataTableViewOptionsProps<TData> {
  table: Table<TData>;
}

export function DataTableViewOptions<TData>({
  table,
}: DataTableViewOptionsProps<TData>) {
  const { setColumnVisibility, columnVisibility } = useTableStore();

  // Sync table visibility with store visibility on mount and when store changes
  React.useEffect(() => {
    table.setColumnVisibility(columnVisibility);
  }, [table, columnVisibility]);

  const toggleColumnVisibility = (columnId: string, visible: boolean) => {
    const newVisibility = {
      ...columnVisibility,
      [columnId]: visible,
    };
    setColumnVisibility(newVisibility);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="ml-auto h-8 gap-2 focus:outline-none focus:ring-1 focus:ring-ring focus-visible:ring-0"
        >
          <Settings2 className="h-4 w-4" />
          View
          <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuGroup>
          {table
            .getAllColumns()
            .filter((column) => column.getCanHide())
            .map((column) => (
              <DropdownMenuItem
                key={column.id}
                onClick={() =>
                  toggleColumnVisibility(column.id, !column.getIsVisible())
                }
                className="cursor-pointer"
              >
                <span className="truncate">
                  {column.id.charAt(0).toUpperCase() + column.id.slice(1)}
                </span>
                <Check
                  className={`ml-auto h-4 w-4 shrink-0 ${
                    column.getIsVisible() ? "opacity-100" : "opacity-0"
                  }`}
                />
              </DropdownMenuItem>
            ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
