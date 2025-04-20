import React from "react";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  error: string;
}

export function ErrorState({ error }: ErrorStateProps) {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="bg-destructive/10 text-destructive p-8 rounded-lg max-w-lg mx-auto text-center shadow-sm">
        <h1 className="text-2xl font-bold mb-3">Error</h1>
        <p className="mb-4">{error}</p>
        <Button
          variant="outline"
          onClick={() => (window.location.href = "/dashboards")}
        >
          Back to Dashboards
        </Button>
      </div>
    </div>
  );
}
