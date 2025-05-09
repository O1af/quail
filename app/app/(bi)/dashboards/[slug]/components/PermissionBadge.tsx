import React from "react";

interface PermissionBadgeProps {
  permission: string;
}

export const PermissionBadge: React.FC<PermissionBadgeProps> = ({
  permission,
}) => {
  const getBadgeStyles = () => {
    switch (permission) {
      case "owner":
        return "bg-primary/20 text-primary";
      case "editor":
        return "bg-amber-500/20 text-amber-600";
      case "viewer":
      case "public":
      case "anonymous":
      default:
        return "bg-muted/30 text-muted-foreground";
    }
  };

  const getLabel = () => {
    switch (permission) {
      case "owner":
        return "Owner";
      case "editor":
        return "Editor";
      case "viewer":
        return "Viewer";
      case "public":
      case "anonymous":
        return "Public";
      default:
        return permission;
    }
  };

  return (
    <span
      className={`px-2 py-0.5 text-xs rounded-full font-medium ${getBadgeStyles()}`}
    >
      {getLabel()}
    </span>
  );
};
