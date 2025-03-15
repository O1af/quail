import React from "react";
import { InfoIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { PermissionBadge } from "./PermissionBadge";

interface PermissionBadgeDisplayProps {
  permission: string | null;
  userName?: string;
  userEmail?: string;
}

export const PermissionBadgeDisplay: React.FC<PermissionBadgeDisplayProps> = ({
  permission,
  userName,
  userEmail,
}) => {
  if (!permission) return null;

  const getPermissionDescription = () => {
    switch (permission) {
      case "owner":
        return "You own this dashboard and have full control";
      case "editor":
        return "You can edit this dashboard";
      case "viewer":
        return "You can view but not edit this dashboard";
      case "public":
        return "This is a public dashboard";
      default:
        return `Your access level: ${permission}`;
    }
  };

  return (
    <div className="flex items-center mb-4 bg-muted/20 px-3 py-2 rounded-md shadow-sm">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-2 cursor-help">
              <InfoIcon className="h-4 w-4 text-muted-foreground" />
              <div className="flex items-center gap-2">
                <PermissionBadge permission={permission} />
                <span className="text-sm text-muted-foreground">
                  {getPermissionDescription()}
                </span>
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent side="right" align="start">
            <p>
              {userName || userEmail
                ? `Signed in as ${userName || userEmail}`
                : "Access information"}
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};
