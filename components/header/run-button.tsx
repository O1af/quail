"use client";
import React, { useEffect, useCallback, useState } from "react";
import { AlertCircle, Loader2, Play, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useEditorStore } from "../stores/editor_store";
import { shallow } from "zustand/shallow";
import { useToast } from "@/lib/hooks/use-toast";

// Separate button component to prevent unnecessary re-renders
const ExecuteButton = React.memo(function ExecuteButton({
  error,
  isExecuting,
  success,
  onClick,
}: {
  error: string | null;
  isExecuting: boolean;
  success: boolean;
  onClick: () => void;
}) {
  return (
    <Button
      variant={error ? "destructive" : success ? "outline" : "outline"}
      size="icon"
      onClick={onClick}
      disabled={isExecuting}
      className={success ? "text-green-500 border-green-500" : ""}
    >
      {isExecuting ? (
        <Loader2 className="h-[1.2rem] w-[1.2rem] animate-spin" />
      ) : error ? (
        <AlertCircle className="h-[1.2rem] w-[1.2rem]" />
      ) : success ? (
        <Check className="h-[1.2rem] w-[1.2rem]" />
      ) : (
        <Play className="h-[1.2rem] w-[1.2rem]" />
      )}
      <span className="sr-only">Execute code</span>
    </Button>
  );
});

export const RunButton = React.memo(function RunButton() {
  const isExecuting = useEditorStore((state) => state.isExecuting);
  const error = useEditorStore((state) => state.error);
  const [displayError, setDisplayError] = useState(false);
  const executeQuery = useEditorStore((state) => state.executeQuery);
  const clearError = useEditorStore((state) => state.clearError);
  const [success, setSuccess] = React.useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (error) {
      setDisplayError(true);
      toast({
        variant: "destructive",
        title: "Error executing query",
        description: error,
      });
      const timer = setTimeout(() => setDisplayError(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const handleExecute = useCallback(() => {
    clearError();
    executeQuery().then(() => {
      if (!error) setSuccess(true);
    });
  }, [executeQuery, error]);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span>
            <ExecuteButton
              error={displayError ? error : null}
              isExecuting={isExecuting}
              success={success}
              onClick={handleExecute}
            />
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <p>{success ? "Query executed successfully" : "Run query"}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
});
