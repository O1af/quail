"use client";
import { AlertCircle, Loader2, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEditorStore } from "./stores/editor_store";
import { useEffect } from "react";

export function RunButton() {
  const { executeQuery, isExecuting, error, clearError } = useEditorStore();

  useEffect(() => {
    if (error) {
      const timer = setTimeout(clearError, 3000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  return (
    <Button
      variant={error ? "destructive" : "outline"}
      size="icon"
      onClick={() => executeQuery()}
      disabled={isExecuting}
      title={error || undefined}
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
}
