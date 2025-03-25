import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  PencilRuler,
  LayoutGrid,
  Save,
  X,
  Loader2,
  Crown,
  Pencil,
  Eye,
  Globe,
  User,
} from "lucide-react";
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

// Map permission types to icons and colors
const permissionIcons = {
  owner: {
    icon: <Crown className="h-3 w-3" />,
    color: "text-yellow-500",
    bg: "bg-yellow-50",
    tooltip: "Owner",
  },
  editor: {
    icon: <Pencil className="h-3 w-3" />,
    color: "text-blue-500",
    bg: "bg-blue-50",
    tooltip: "Editor",
  },
  viewer: {
    icon: <Eye className="h-3 w-3" />,
    color: "text-green-500",
    bg: "bg-green-50",
    tooltip: "Viewer",
  },
  public: {
    icon: <Globe className="h-3 w-3" />,
    color: "text-purple-500",
    bg: "bg-purple-50",
    tooltip: "Public",
  },
  anonymous: {
    icon: <User className="h-3 w-3" />,
    color: "text-gray-500",
    bg: "bg-gray-50",
    tooltip: "Anonymous",
  },
};

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
  // Get permission details or default to anonymous if null
  const permissionDetails = userPermission
    ? permissionIcons[userPermission]
    : permissionIcons.anonymous;

  return (
    <div className="flex-none p-4 pb-2">
      <div className="flex justify-between items-center mb-4">
        {/* Permission badge - left side */}
        {userPermission && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge
                  variant="outline"
                  className={`${permissionDetails.bg} ${permissionDetails.color} px-2 py-1 flex items-center gap-1`}
                >
                  {permissionDetails.icon}
                  <span className="text-xs">
                    {userPermission.charAt(0).toUpperCase() +
                      userPermission.slice(1)}
                  </span>
                </Badge>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>Your permission: {permissionDetails.tooltip}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        {/* Action buttons - right side */}
        <div>
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
    </div>
  );
}
