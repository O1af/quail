import { createClient } from "@/utils/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { loadUserDashboards } from "@/components/stores/dashboard_store";
import { listCharts } from "@/components/stores/chart_store";
import { listChats } from "@/components/stores/chat_store";

export interface ActivityItem {
  id: string;
  type:
    | "dashboard_created"
    | "chart_updated"
    | "dashboard_updated"
    | "chat_created";
  title: string;
  timestamp: Date;
  relativeTime?: string;
  entityId?: string;
  entityType?: string;
}

/**
 * Fetches recent user activities based on actual user data
 *
 * @param userId The ID of the user to fetch activities for
 * @param limit Maximum number of activities to return
 * @returns Array of activity items sorted by most recent first
 */
export async function fetchRecentActivities(
  userId: string,
  limit: number = 10
): Promise<ActivityItem[]> {
  try {
    if (!userId) {
      console.warn("fetchRecentActivities called with no userId");
      return [];
    }

    // Fetch all user data from stores
    const [dashboards, charts, chats] = await Promise.all([
      loadUserDashboards(userId, { limit: limit }), // Pass limit to loadUserDashboards
      listCharts(userId, limit), // Pass limit to listCharts
      listChats(userId, limit), // Pass limit to listChats
    ]);

    // Create activities from dashboards
    const dashboardActivities: ActivityItem[] = dashboards.map((dashboard) => ({
      id: `dash-${dashboard._id}`,
      type: "dashboard_updated",
      title: `Dashboard "${dashboard.title}" updated`,
      timestamp: new Date(dashboard.updatedAt),
      entityId: dashboard._id,
      entityType: "dashboard",
    }));

    // Add dashboard creation events (if creation time differs significantly from update time)
    const dashboardCreationActivities: ActivityItem[] = dashboards
      .filter((dashboard) => {
        // Only include if creation is at least 5 minutes before last update
        // This helps avoid duplicate activities for newly created dashboards
        const createdAt = new Date(dashboard.createdAt).getTime();
        const updatedAt = new Date(dashboard.updatedAt).getTime();
        return updatedAt - createdAt > 5 * 60 * 1000; // 5 minutes in milliseconds
      })
      .map((dashboard) => ({
        id: `dash-create-${dashboard._id}`,
        type: "dashboard_created",
        title: `Dashboard "${dashboard.title}" created`,
        timestamp: new Date(dashboard.createdAt),
        entityId: dashboard._id,
        entityType: "dashboard",
      }));

    // Create activities from charts
    const chartActivities: ActivityItem[] = charts.map((chart) => ({
      id: `chart-${chart._id}`,
      type: "chart_updated",
      title: `Chart "${chart.title}" updated`,
      timestamp: new Date(chart.updatedAt),
      entityId: chart._id,
      entityType: "chart",
    }));

    // Create activities from chats
    const chatActivities: ActivityItem[] = chats.map((chat) => ({
      id: `chat-${chat._id}`,
      type: "chat_created",
      title: `Chat "${chat.title}" updated`,
      timestamp: new Date(chat.updatedAt),
      entityId: chat._id,
      entityType: "chat",
    }));

    // Combine all activities
    const allActivities: ActivityItem[] = [
      ...dashboardActivities,
      ...dashboardCreationActivities,
      ...chartActivities,
      ...chatActivities,
    ];

    // Sort by timestamp (newest first) and limit
    const sortedActivities = allActivities
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);

    // Add relative time descriptions
    return sortedActivities.map((activity) => ({
      ...activity,
      relativeTime: formatDistanceToNow(activity.timestamp, {
        addSuffix: true,
      }),
    }));
  } catch (error) {
    console.error("Failed to fetch activities:", error);
    return [];
  }
}
