import React from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  actionText?: string; // Make optional
  onAction?: () => void; // Make optional
}

export function EmptyState({
  title,
  description,
  icon,
  actionText,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center space-y-2">
      {icon}
      <h3 className="text-lg font-medium">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm mx-auto">
        {description}
      </p>
      {actionText &&
        onAction && ( // Only render button if both actionText and onAction are provided
          <Button variant="outline" className="mt-6" onClick={onAction}>
            {actionText?.includes("Clear") ? (
              <X className="mr-2 h-4 w-4" />
            ) : null}
            {actionText}
          </Button>
        )}
    </div>
  );
}
