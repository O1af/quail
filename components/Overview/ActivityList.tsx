import React from "react";
import { ActivityItem } from "@/lib/utils/activity";
import Link from "next/link";
import {
  BarChart3,
  Clock,
  MessageSquareText,
  PlusCircle,
  LayoutDashboard,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ActivityListProps {
  activities: ActivityItem[];
  className?: string;
  onItemClick?: (activity: ActivityItem) => void;
  maxHeight?: string; // New prop to control scroll container height
  showScrollbar?: boolean; // Option to show/hide scrollbar
}

/**
 * Component to display a scrollable list of user activities
 */
export function ActivityList({
  activities,
  className = "",
  onItemClick,
  maxHeight = "300px", // Default height of 300px
  showScrollbar = true, // Show scrollbar by default
}: ActivityListProps) {
  // Helper function to get icon based on activity type
  const getActivityIcon = (type: ActivityItem["type"]) => {
    switch (type) {
      case "dashboard_created":
        return (
          <PlusCircle className="h-4 w-4 text-emerald-500 flex-shrink-0" />
        );
      case "dashboard_updated":
        return (
          <LayoutDashboard className="h-4 w-4 text-indigo-500 flex-shrink-0" />
        );
      case "chart_updated":
        return <BarChart3 className="h-4 w-4 text-amber-500 flex-shrink-0" />;
      case "chat_created":
        return (
          <MessageSquareText className="h-4 w-4 text-blue-500 flex-shrink-0" />
        );
      default:
        return <Clock className="h-4 w-4 text-gray-500 flex-shrink-0" />;
    }
  };

  // Helper function to get link path for an activity
  const getActivityPath = (activity: ActivityItem) => {
    if (!activity.entityId) return null;

    switch (activity.entityType) {
      case "dashboard":
        return `/dashboards/${activity.entityId}`;
      case "chart":
        return `/charts/${activity.entityId}`;
      case "chat":
        return `/chat?id=${activity.entityId}`;
      default:
        return null;
    }
  };

  return (
    <div
      className={cn("space-y-1", className)}
      style={{
        maxHeight,
        overflowY: "auto",
        scrollbarWidth: showScrollbar ? "thin" : "none",
      }}
    >
      {activities.length === 0 ? (
        <div className="text-center py-4 text-muted-foreground">
          <Clock className="h-5 w-5 mx-auto mb-2 opacity-50" />
          <p>No recent activity found</p>
          <p className="text-xs mt-1">
            Activities will appear here as you create dashboards and charts
          </p>
        </div>
      ) : (
        <div className="py-1">
          {activities.map((activity) => {
            const path = getActivityPath(activity);
            const ActivityContent = (
              <div
                className={cn(
                  "flex items-center gap-3 p-2 rounded-md transition-colors",
                  path ? "hover:bg-muted/50 cursor-pointer" : ""
                )}
                onClick={() => path && onItemClick?.(activity)}
              >
                {getActivityIcon(activity.type)}
                <div className="space-y-1 min-w-0">
                  <p className="text-sm font-medium leading-none truncate">
                    {activity.title}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {activity.relativeTime || "Recently"}
                  </p>
                </div>
              </div>
            );

            return (
              <div key={activity.id}>
                {path ? (
                  <Link href={path}>{ActivityContent}</Link>
                ) : (
                  ActivityContent
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
