"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { MessageCircleOff } from "lucide-react";

export function ClearChat() {
  const handleClearChat = () => {
    // Dispatch a custom event that can be caught by the Chat component
    const clearEvent = new CustomEvent("clear-chat");
    window.dispatchEvent(clearEvent);
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={handleClearChat}
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
