import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { EmptyStateProps } from "../types";
import { CreateDashboard } from "@/components/header/create-dashboard";

export function EmptyState({
  title,
  description,
  actionText,
  icon,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="text-center py-12 px-4 border-2 border-dashed rounded-lg col-span-full flex flex-col items-center justify-center">
      {icon}
      <h3 className="text-lg font-medium mt-2">{title}</h3>
      <p className="text-sm text-muted-foreground mt-1 max-w-md">
        {description}
      </p>
      <Button variant="outline" className="mt-6" onClick={onAction}>
        {actionText.includes("Clear") ? (
          <X className="mr-2 h-4 w-4" />
        ) : (
          <CreateDashboard />
        )}
        {actionText}
      </Button>
    </div>
  );
}
