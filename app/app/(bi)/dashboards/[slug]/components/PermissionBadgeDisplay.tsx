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
    <div className="flex items-center mb-4 px-3 py-0">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <PermissionBadge permission={permission} />
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent side="right" align="start">
            {getPermissionDescription()}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};
