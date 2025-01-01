"use client";
import React, { useEffect, useCallback } from "react";
import { AlertCircle, Loader2, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useEditorStore } from "../stores/editor_store";
import { shallow } from "zustand/shallow";

// Separate button component to prevent unnecessary re-renders
const ExecuteButton = React.memo(function ExecuteButton({
  error,
  isExecuting,
  onClick,
}: {
  error: string | null;
  isExecuting: boolean;
  onClick: () => void;
}) {
  return (
    <Button
      variant={error ? "destructive" : "outline"}
      size="icon"
      onClick={onClick}
      disabled={isExecuting}
    >
      {isExecuting ? (
        <Loader2 className="h-[1.2rem] w-[1.2rem] animate-spin" />
      ) : error ? (
        <AlertCircle className="h-[1.2rem] w-[1.2rem]" />
      ) : (
        <Play className="h-[1.2rem] w-[1.2rem]" />
      )}
      <span className="sr-only">Execute code</span>
    </Button>
  );
});

export const RunButton = React.memo(function RunButton() {
  // Separate selectors to prevent unnecessary re-renders
  const isExecuting = useEditorStore((state) => state.isExecuting);
  const error = useEditorStore((state) => state.error);
  const executeQuery = useEditorStore((state) => state.executeQuery);
  const clearError = useEditorStore((state) => state.clearError);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(clearError, 3000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  const handleExecute = useCallback(() => {
    executeQuery();
  }, [executeQuery]);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span>
            <ExecuteButton
              error={error}
              isExecuting={isExecuting}
              onClick={handleExecute}
            />
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <p>{error || "Run query"}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
});
