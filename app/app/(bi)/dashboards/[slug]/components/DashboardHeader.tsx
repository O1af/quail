import React from "react";
import { Button } from "@/components/ui/button";
import { PencilRuler, LayoutGrid, Save, X, Loader2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface DashboardHeaderProps {
  isEditing: boolean;
  userPermission: "owner" | "editor" | "viewer" | "public" | "anonymous" | null;
  handleEdit: () => void;
  handleCancel: () => void;
  handleSave: () => Promise<void>;
  isSaving: boolean;
  hasUnsavedChanges: boolean;
  setIsManageChartsOpen: (open: boolean) => void;
}

export function DashboardHeader({
  isEditing,
  userPermission,
  handleEdit,
  handleCancel,
  handleSave,
  isSaving,
  hasUnsavedChanges,
  setIsManageChartsOpen,
}: DashboardHeaderProps) {
  return (
    <div className="flex-none p-4 pb-2">
      <div className="flex justify-end items-center mb-4">
        {!isEditing ? (
          // Only show Edit button to owners and editors when logged in
          (userPermission === "owner" || userPermission === "editor") && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="secondary" onClick={handleEdit}>
                    <PencilRuler className="mr-2 h-4 w-4" /> Edit Dashboard
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Edit dashboard title, description and layout</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )
        ) : (
          <div className="space-x-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    onClick={() => setIsManageChartsOpen(true)}
                    className="border-dashed"
                  >
                    <LayoutGrid className="mr-2 h-4 w-4" /> Manage Charts
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Add or remove charts from this dashboard</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Button variant="outline" onClick={handleCancel}>
              <X className="mr-2 h-4 w-4" /> Cancel
            </Button>

            <Button
              onClick={handleSave}
              disabled={isSaving}
              className={hasUnsavedChanges ? "animate-pulse" : ""}
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" /> Save Changes
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
