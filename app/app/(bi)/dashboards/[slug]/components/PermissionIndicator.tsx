import React from "react";
import { PencilRuler, Share2 } from "lucide-react";

interface PermissionIndicatorProps {
  userPermission: "owner" | "editor" | "viewer" | "public" | "anonymous" | null;
  user: any | null;
}

export function PermissionIndicator({
  userPermission,
  user,
}: PermissionIndicatorProps) {
  return (
    <div className="mb-4 mx-4 bg-muted/30 p-3 rounded-md border border-muted/30 text-sm flex items-center gap-2">
      <div className="bg-primary/10 p-1 rounded">
        {userPermission === "editor" ? (
          <PencilRuler className="h-4 w-4 text-primary" />
        ) : (
          <Share2 className="h-4 w-4 text-primary" />
        )}
      </div>
      <div>
        {userPermission === "editor" && (
          <p>
            You have editor access to this dashboard. You can make changes and
            add charts.
          </p>
        )}
        {userPermission === "viewer" && (
          <p>
            You have view-only access to this dashboard. Contact the owner to
            request edit permissions.
          </p>
        )}
        {userPermission === "public" && (
          <p>
            This is a publicly shared dashboard with all authenticated users.
          </p>
        )}
      </div>
    </div>
  );
}
