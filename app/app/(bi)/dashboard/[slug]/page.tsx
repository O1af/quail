"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import {
  loadDashboard,
  Dashboard,
  updateDashboard,
} from "@/components/stores/dashboard_store";
import { Loader2, PencilRuler, LayoutGrid, Share2 } from "lucide-react";
import { loadChart } from "@/components/stores/chart_store"; // Updated import
import { Button } from "@/components/ui/button";
import { ChartDocument } from "@/lib/types/stores/chart"; // Added import for ChartDocument

import { DashboardGrid } from "@/app/app/(bi)/dashboard/[slug]/components/DashboardGrid";
import { TitleEditor } from "./components/TitleEditor";
import { ManageChartsModal } from "./components/ManageChartsModal";
import { useHeader } from "@/components/header/header-context";
import { ShareDialog } from "./components/ShareDialog"; // Add import for ShareDialog

export default function Page({
  params,
}: {
  params: Promise<{ slug: string }> | { slug: string };
}) {
  // Use React.use() to unwrap the params promise
  const resolvedParams = React.use(params as Promise<{ slug: string }>);
  const { slug } = resolvedParams;

  const [user, setUser] = useState<any>(null);
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [chartData, setChartData] = useState<Map<string, ChartDocument | null>>(
    new Map()
  ); // Updated type
  const { setHeaderContent, setHeaderButtons } = useHeader();

  // State for manage charts modal
  const [isManageChartsOpen, setIsManageChartsOpen] = useState(false);
  // State for title editing
  const [tempTitle, setTempTitle] = useState("");
  const [tempDescription, setTempDescription] = useState(""); // Added state for description
  // State for share dialog
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  // Add a state to track user permission level
  const [userPermission, setUserPermission] = useState<
    "owner" | "editor" | "viewer" | "public" | null
  >(null);

  useEffect(() => {
    setHeaderContent(
      <div className="flex flex-1 justify-between items-center w-full">
        <div>
          <TitleEditor
            isEditing={isEditing}
            title={dashboard?.title || "Dashboard"}
            description={dashboard?.description || ""} // Pass description
            tempTitle={tempTitle}
            tempDescription={tempDescription} // Pass temp description
            onTitleChange={handleTitleChange}
            onDescriptionChange={handleDescriptionChange} // New handler
          />
          {/* {!isEditing && (
            <p className="text-sm text-muted-foreground">
              {dashboard?.description || "No description available"}
            </p>
          )} */}
        </div>
        <div className="w-full ml-4 max-w-lg mr-4"></div>
      </div>
    );

    setHeaderButtons(
      <div className="flex items-center gap-2">
        {dashboard && user && (
          <>
            {/* Only show Share button to owners */}
            {userPermission === "owner" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsShareModalOpen(true)}
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            )}
          </>
        )}
      </div>
    );

    return () => {
      // Clean up by resetting header when component unmounts
      setHeaderContent(null);
      setHeaderButtons(null);
    };
  }, [
    setHeaderContent,
    setHeaderButtons,
    tempTitle,
    tempDescription,
    dashboard,
    isEditing,
    user, // Add user to dependency array
    userPermission, // Add userPermission to the dependency array
  ]);

  // Use ref for layouts to prevent re-rendering
  const tempLayoutsRef = useRef<any[]>([]);

  // Use ref for charts to track changes during edit mode
  const tempChartsRef = useRef<string[]>([]);

  const supabase = createClient();

  // Title change handler that doesn't cause grid re-render
  const handleTitleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setTempTitle(e.target.value);
    },
    []
  );

  // Add description change handler
  const handleDescriptionChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setTempDescription(e.target.value);
    },
    []
  );

  const handleEdit = useCallback(() => {
    // Initialize tempLayouts with current dashboard layout when editing starts
    if (dashboard?.layout) {
      tempLayoutsRef.current = [...dashboard.layout];
    }
    // Initialize tempCharts with current dashboard charts
    if (dashboard?.charts) {
      tempChartsRef.current = [...dashboard.charts];
    }
    // Set the temporary title and description when entering edit mode
    setTempTitle(dashboard?.title || "Dashboard");
    setTempDescription(dashboard?.description || "");
    setIsEditing(true);
  }, [dashboard]);

  const handleSave = useCallback(async () => {
    if (!dashboard || !user) return;

    const trimmedTitle = tempTitle.trim() || "Dashboard";
    const trimmedDescription = tempDescription.trim();

    setIsLoading(true);
    try {
      // Save title, description, layout and charts changes
      await updateDashboard(slug, dashboard.userId, {
        title: trimmedTitle,
        description: trimmedDescription,
        layout: tempLayoutsRef.current,
        charts: tempChartsRef.current,
      });

      // Update the local dashboard state
      setDashboard((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          title: trimmedTitle,
          description: trimmedDescription,
          layout: tempLayoutsRef.current,
          charts: tempChartsRef.current,
        };
      });

      // Update chart data for any newly added charts
      const currentChartIds = Array.from(chartData.keys());
      const newChartIds = tempChartsRef.current.filter(
        (id) => !currentChartIds.includes(id)
      );

      if (newChartIds.length > 0) {
        const newChartDataMap = new Map(chartData);
        for (const chartId of newChartIds) {
          try {
            const chart = await loadChart(chartId, user.id);
            newChartDataMap.set(chartId, chart);
          } catch (err) {
            console.error(`Failed to load chart ${chartId}:`, err);
            newChartDataMap.set(chartId, null);
          }
        }
        setChartData(newChartDataMap);
      }

      console.log("Dashboard updated successfully");
    } catch (err) {
      console.error("Failed to save dashboard changes:", err);
    } finally {
      setIsLoading(false);
      setIsEditing(false);
    }
  }, [dashboard, user, slug, tempTitle, tempDescription, chartData]);

  const handleCancel = useCallback(() => {
    // Reset temporary values when cancelling
    tempLayoutsRef.current = dashboard?.layout || [];
    tempChartsRef.current = dashboard?.charts || [];
    setTempTitle(dashboard?.title || "Dashboard");
    setTempDescription(dashboard?.description || "");
    setIsEditing(false);
  }, [dashboard]);

  // Chart management handler - updated to handle apply/cancel and add default layout positions
  const handleChartsChange = useCallback(
    (newCharts: string[], apply: boolean) => {
      console.log(
        "Charts changed:",
        newCharts,
        apply ? "(applied)" : "(cancelled)"
      );

      if (apply) {
        // Create a set of existing chart IDs for quick lookup
        const existingChartIds = new Set(tempChartsRef.current);

        // Find any new charts that were added
        const addedCharts = newCharts.filter(
          (chartId) => !existingChartIds.has(chartId)
        );

        // Update charts reference
        tempChartsRef.current = newCharts;

        // Clean up layouts to remove any charts that were removed
        tempLayoutsRef.current = tempLayoutsRef.current.filter((item) =>
          newCharts.includes(item.i)
        );

        // Add default layout items for new charts
        if (addedCharts.length > 0) {
          // Find the maximum y-coordinate to place new charts below existing ones
          const maxY =
            tempLayoutsRef.current.length > 0
              ? Math.max(
                  ...tempLayoutsRef.current.map((item) => item.y + item.h)
                )
              : 0;

          // Add default layout items for each new chart
          const newLayoutItems = addedCharts.map((chartId, index) => ({
            i: chartId,
            x: 0, // Start at the left edge
            y: maxY + index * 4, // Stack vertically, spaced 4 units apart
            w: 12, // Full width (12 columns)
            h: 9, // Default height of 9 units
            minW: 3, // Minimum width
            minH: 3, // Minimum height
          }));

          // Add the new layout items to the layouts
          tempLayoutsRef.current = [
            ...tempLayoutsRef.current,
            ...newLayoutItems,
          ];
        }
      } else {
        // If canceled, don't do anything - keep the original charts
        console.log("Chart changes canceled, keeping original charts");
      }
    },
    []
  );

  // Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          window.location.href = `${process.env.NEXT_PUBLIC_APP_URL}/login`;
          return;
        }

        setUser(user);
      } catch (err) {
        console.error("Error fetching user:", err);
        setError("Failed to authenticate user");
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [supabase]);

  /**
   * Checks the user's permission level for the dashboard
   * @returns 'owner', 'editor', 'viewer', 'public', or null if no access
   */
  const checkUserPermissions = useCallback(
    (dashboard: Dashboard, userEmail: string, userId: string) => {
      // Check if user is owner
      if (dashboard.userId === userId) {
        return "owner";
      }

      // Check if user is in editors list
      if (dashboard.permissions?.editors?.includes(userEmail)) {
        return "editor";
      }

      // Check if user is in viewers list
      if (dashboard.permissions?.viewers?.includes(userEmail)) {
        return "viewer";
      }

      // Check if dashboard is public
      if (dashboard.permissions?.publicView) {
        return "public";
      }

      // No access
      return null;
    },
    []
  );

  // Fetch dashboard and chart data when user is loaded
  useEffect(() => {
    const fetchDashboard = async () => {
      if (!user) return;

      try {
        setIsLoading(true);
        const dashboardData = await loadDashboard(slug);

        if (!dashboardData) {
          setError("Dashboard not found");
          setIsLoading(false);
          return;
        }

        // Check if the user has permissions to view this dashboard
        const permissionLevel = checkUserPermissions(
          dashboardData,
          user.email,
          user.id
        );

        if (!permissionLevel) {
          setError("You don't have permission to view this dashboard");
          setIsLoading(false);
          return;
        }

        // Update permission state
        setUserPermission(permissionLevel);

        // Set dashboard data
        setDashboard(dashboardData);

        // Only allow editing if the user is owner or editor
        if (permissionLevel === "owner" || permissionLevel === "editor") {
          // We'll handle the Edit button visibility separately
        } else {
          // For viewers and public access, ensure edit mode is off
          setIsEditing(false);
        }

        const chartDataMap = new Map<string, ChartDocument | null>();

        // Load charts in parallel to improve performance
        const chartPromises = dashboardData.charts.map(async (chartId) => {
          try {
            const chart = await loadChart(chartId, dashboardData.userId);
            return { chartId, chart };
          } catch (err) {
            console.error(`Error loading chart ${chartId}:`, err);
            return { chartId, chart: null };
          }
        });

        // Wait for all chart data to be fetched
        const chartResults = await Promise.all(chartPromises);

        // Populate the map
        chartResults.forEach(({ chartId, chart }) => {
          chartDataMap.set(chartId, chart);
        });

        console.log("Chart data loaded:", chartDataMap);
        setChartData(chartDataMap);
      } catch (err) {
        console.error("Error loading dashboard:", err);
        setError("Failed to load dashboard");
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchDashboard();
    }
  }, [slug, user, checkUserPermissions]);

  // Update layouts ref when dashboard changes
  const handleLayoutChange = useCallback(
    (layout: any) => {
      if (isEditing) {
        tempLayoutsRef.current = layout;
      }
    },
    [isEditing]
  );

  // Handle updating dashboard permissions
  const handleUpdatePermissions = useCallback(
    async (newPermissions: Dashboard["permissions"]) => {
      if (!dashboard || !user) return;

      setIsLoading(true);
      try {
        await updateDashboard(slug, user.id, {
          permissions: newPermissions,
        });

        // Update the local dashboard state
        setDashboard((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            permissions: newPermissions,
          };
        });

        console.log("Dashboard permissions updated successfully");
      } catch (err) {
        console.error("Failed to update dashboard permissions:", err);
        throw err; // Re-throw to be handled by the ShareDialog component
      } finally {
        setIsLoading(false);
      }
    },
    [dashboard, user, slug]
  );

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-destructive/10 text-destructive p-6 rounded-lg max-w-lg mx-auto text-center">
          <h1 className="text-xl font-bold mb-2">Error</h1>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  // Show dashboard content when loaded
  return (
    <div className="p-4 py-2 pb-2">
      <div className="justify-between items-center mb-6">
        <div className="flex gap-2">
          {!isEditing ? (
            // Only show Edit button to owners and editors
            (userPermission === "owner" || userPermission === "editor") && (
              <Button
                variant="secondary"
                onClick={handleEdit}
                className="ml-auto"
              >
                <PencilRuler className="mr-2 h-4 w-4" /> Edit
              </Button>
            )
          ) : (
            <div className="space-x-2 ml-auto">
              <Button
                variant="outline"
                onClick={() => setIsManageChartsOpen(true)}
              >
                <LayoutGrid className="mr-2 h-4 w-4" /> Manage Charts
              </Button>
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button onClick={handleSave}>Save</Button>
            </div>
          )}
        </div>
      </div>

      {/* Show permission indicator for non-owners */}
      {userPermission && userPermission !== "owner" && (
        <div className="mb-4 bg-muted/30 p-2 rounded-md text-sm text-muted-foreground flex items-center">
          {userPermission === "editor" && (
            <>You have editor access to this dashboard</>
          )}
          {userPermission === "viewer" && (
            <>You have view-only access to this dashboard</>
          )}
          {userPermission === "public" && (
            <>This is a publicly shared dashboard</>
          )}
        </div>
      )}

      {dashboard?.charts &&
      (isEditing
        ? tempChartsRef.current.length > 0
        : dashboard.charts.length > 0) ? (
        <DashboardGrid
          dashboard={{
            ...dashboard,
            charts: isEditing ? tempChartsRef.current : dashboard.charts,
            layout: isEditing ? tempLayoutsRef.current : dashboard.layout,
          }}
          chartData={chartData}
          isEditing={isEditing}
          onLayoutChange={handleLayoutChange}
        />
      ) : (
        <div className="text-center py-12 bg-muted/50 rounded-lg">
          <p className="text-lg text-muted-foreground">
            This dashboard doesn't have any charts yet
          </p>
          {isEditing && (
            <Button
              className="mt-4"
              variant="outline"
              onClick={() => setIsManageChartsOpen(true)}
            >
              <LayoutGrid className="mr-2 h-4 w-4" /> Add Charts
            </Button>
          )}
        </div>
      )}

      {/* Manage Charts Modal - updated to pass the new handler */}
      {user && dashboard && (
        <ManageChartsModal
          open={isManageChartsOpen}
          onOpenChange={setIsManageChartsOpen}
          userId={user.id}
          currentCharts={tempChartsRef.current}
          onChartsChange={handleChartsChange}
        />
      )}

      {/* Add Share Dialog */}
      {user && dashboard && (
        <ShareDialog
          open={isShareModalOpen}
          onOpenChange={setIsShareModalOpen}
          dashboard={dashboard}
          onUpdatePermissions={handleUpdatePermissions}
        />
      )}
    </div>
  );
}
