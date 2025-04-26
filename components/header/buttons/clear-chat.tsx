"use client";
import React from "react";
import { useDatabase } from "@/lib/hooks/use-database";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { MessageCircleOff } from "lucide-react";

export function ClearChat() {
  const { setDatabaseChange } = useDatabase();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={() => setDatabaseChange()}
            variant="ghost"
            size="icon"
            className="h-8 w-8 p-0"
          >
            <MessageCircleOff className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p>Clear Chat History</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
