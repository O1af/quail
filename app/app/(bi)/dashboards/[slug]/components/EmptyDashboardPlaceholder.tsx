import React from "react";
import { Button } from "@/components/ui/button";
import { LayoutGrid } from "lucide-react";

interface EmptyDashboardPlaceholderProps {
  isEditing: boolean;
  setIsManageChartsOpen: (open: boolean) => void;
}

export function EmptyDashboardPlaceholder({
  isEditing,
  setIsManageChartsOpen,
}: EmptyDashboardPlaceholderProps) {
  return (
    <div className="text-center py-16 bg-muted/50 rounded-lg border border-dashed border-muted">
      <p className="text-lg text-muted-foreground mb-3">
        This dashboard doesn't have any charts yet
      </p>
      {isEditing && (
        <Button className="mt-2" onClick={() => setIsManageChartsOpen(true)}>
          <LayoutGrid className="mr-2 h-4 w-4" /> Add Charts
        </Button>
      )}
    </div>
  );
}
