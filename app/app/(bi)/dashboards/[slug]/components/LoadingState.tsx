import React from "react";
import { Loader2 } from "lucide-react";

interface LoadingStateProps {
  isAuthLoading: boolean;
}

export function LoadingState({ isAuthLoading }: LoadingStateProps) {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center gap-3 bg-card/50 p-8 rounded-lg shadow-xs">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-base font-medium">
          {isAuthLoading
            ? "Checking authentication..."
            : "Loading dashboard..."}
        </p>
        {isAuthLoading && (
          <p className="text-sm text-muted-foreground">
            We're verifying your access to this dashboard
          </p>
        )}
      </div>
    </div>
  );
}
