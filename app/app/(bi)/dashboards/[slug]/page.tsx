"use client";
import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import { createClient } from "@/utils/supabase/client";
import {
  loadDashboard,
  Dashboard,
  updateDashboard,
} from "@/components/stores/dashboard_store";
import {
  Loader2,
  PencilRuler,
  LayoutGrid,
  Share2,
  Save,
  X,
} from "lucide-react";
import { loadChart } from "@/components/stores/chart_store";
import { Button } from "@/components/ui/button";
import { ChartDocument } from "@/lib/types/stores/chart";
import { useToast } from "@/lib/hooks/use-toast";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { DashboardGrid } from "@/app/app/(bi)/dashboards/[slug]/components/DashboardGrid";
import { TitleEditor } from "./components/TitleEditor";
import { ManageChartsModal } from "./components/ManageChartsModal";
import { useHeader } from "@/components/header/header-context";
import { ShareDialog } from "./components/ShareDialog";
import { DashboardHeader } from "./components/DashboardHeader";
import { PermissionIndicator } from "./components/PermissionIndicator";
import { LoadingState } from "./components/LoadingState";
import { ErrorState } from "./components/ErrorState";
import { EmptyDashboardPlaceholder } from "./components/EmptyDashboardPlaceholder";

// Component to show permission badge with appropriate styling
const PermissionBadge = ({ permission }: { permission: string }) => {
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
  const [isAuthLoading, setIsAuthLoading] = useState(true); // Add auth loading state
  const [isSaving, setIsSaving] = useState(false); // Add a separate state for save operation
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [chartData, setChartData] = useState<Map<string, ChartDocument | null>>(
    new Map()
  );
  const { setHeaderContent, setHeaderButtons } = useHeader();
  const { toast } = useToast();

  const [isManageChartsOpen, setIsManageChartsOpen] = useState(false);
  const [tempTitle, setTempTitle] = useState("");
  const [tempDescription, setTempDescription] = useState("");
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [userPermission, setUserPermission] = useState<
    "owner" | "editor" | "viewer" | "public" | "anonymous" | null
  >(null);

  // Added hasUnsavedChanges state to track modifications
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Add a state variable to track chart updates to force re-renders when needed
  const [chartUpdateCounter, setChartUpdateCounter] = useState(0);

  useEffect(() => {
    setHeaderContent(
      <div className="flex flex-1 justify-between items-center w-full">
        <div className="flex items-center gap-2">
          <TitleEditor
            isEditing={isEditing}
            title={dashboard?.title || "Dashboard"}
            description={dashboard?.description || ""}
            tempTitle={tempTitle}
            tempDescription={tempDescription}
            onTitleChange={(e) => {
              handleTitleChange(e);
              setHasUnsavedChanges(true);
            }}
            onDescriptionChange={(e) => {
              handleDescriptionChange(e);
              setHasUnsavedChanges(true);
            }}
          />
          {userPermission && !isEditing && (
            <PermissionBadge permission={userPermission} />
          )}
        </div>
        <div className="w-full ml-4 max-w-lg mr-4"></div>
      </div>
    );

    setHeaderButtons(
      <div className="flex items-center gap-2">
        {dashboard && user && (
          <>
            {userPermission === "owner" && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsShareModalOpen(true)}
                    >
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Share this dashboard with others</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </>
        )}
      </div>
    );

    return () => {
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
    user,
    userPermission,
    hasUnsavedChanges,
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
    setHasUnsavedChanges(false);
  }, [dashboard]);

  const handleSave = useCallback(async () => {
    if (!dashboard || !user) return;

    const trimmedTitle = tempTitle.trim() || "Dashboard";
    const trimmedDescription = tempDescription.trim();

    setIsSaving(true);
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
            const chart = await loadChart(chartId);
            newChartDataMap.set(chartId, chart);
          } catch (err) {
            console.error(`Failed to load chart ${chartId}:`, err);
            newChartDataMap.set(chartId, null);
          }
        }
        setChartData(newChartDataMap);
      }

      toast({
        title: "Dashboard saved",
        description: "Your changes have been saved successfully.",
        duration: 3000,
      });
      setHasUnsavedChanges(false);
    } catch (err) {
      console.error("Failed to save dashboard changes:", err);
      toast({
        title: "Save failed",
        description:
          "There was an error saving your changes. Please try again.",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsSaving(false);
      setIsEditing(false);
    }
  }, [dashboard, user, slug, tempTitle, tempDescription, chartData, toast]);

  const handleCancel = useCallback(() => {
    // If there are unsaved changes, confirm before discarding
    if (hasUnsavedChanges) {
      const confirmed = window.confirm(
        "You have unsaved changes. Are you sure you want to discard them?"
      );
      if (!confirmed) return;
    }

    // Reset temporary values when cancelling
    tempLayoutsRef.current = dashboard?.layout || [];
    tempChartsRef.current = dashboard?.charts || [];
    setTempTitle(dashboard?.title || "Dashboard");
    setTempDescription(dashboard?.description || "");
    setIsEditing(false);
    setHasUnsavedChanges(false);

    toast({
      title: "Changes discarded",
      description: "Your changes have been discarded.",
      duration: 3000,
    });
  }, [dashboard, hasUnsavedChanges, toast]);

  // Chart management handler with improved feedback
  const handleChartsChange = useCallback(
    (newCharts: string[], apply: boolean) => {
      if (apply) {
        const existingChartIds = new Set(tempChartsRef.current);
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
          const maxY =
            tempLayoutsRef.current.length > 0
              ? Math.max(
                  ...tempLayoutsRef.current.map((item) => item.y + item.h)
                )
              : 0;

          const newLayoutItems = addedCharts.map((chartId, index) => ({
            i: chartId,
            x: 0,
            y: maxY + index * 4,
            w: 12,
            h: 9,
            minW: 3,
            minH: 3,
          }));

          tempLayoutsRef.current = [
            ...tempLayoutsRef.current,
            ...newLayoutItems,
          ];

          // Load data for the newly added charts
          const loadNewChartData = async () => {
            const newChartDataMap = new Map(chartData);
            for (const chartId of addedCharts) {
              try {
                const chart = await loadChart(chartId);
                newChartDataMap.set(chartId, chart);
              } catch (err) {
                console.error(`Failed to load chart ${chartId}:`, err);
                newChartDataMap.set(chartId, null);
              }
            }
            setChartData(newChartDataMap);
          };

          loadNewChartData();
        }

        // Increment the chart update counter to force a re-render
        setChartUpdateCounter((prev) => prev + 1);

        // Notify user about changes
        const addedCount = addedCharts.length;
        const removedCount =
          existingChartIds.size - (newCharts.length - addedCharts.length);

        if (addedCount > 0 || removedCount > 0) {
          let message = "";
          if (addedCount > 0)
            message += `Added ${addedCount} chart${
              addedCount !== 1 ? "s" : ""
            }. `;
          if (removedCount > 0)
            message += `Removed ${removedCount} chart${
              removedCount !== 1 ? "s" : ""
            }.`;

          toast({
            title: "Charts updated",
            description: message.trim(),
            duration: 3000,
          });

          setHasUnsavedChanges(true);
        }
      }
    },
    [chartData, toast]
  );

  // Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      setIsAuthLoading(true); // Set auth loading to true when starting
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        // Store user (might be null for anonymous viewers)
        setUser(user);
      } catch (err) {
        console.error("Error fetching user:", err);
      } finally {
        setIsAuthLoading(false); // Set auth loading to false when completed
      }
    };

    fetchUser();
  }, [supabase]);

  /**
   * Checks the user's permission level for the dashboard
   * @returns 'owner', 'editor', 'viewer', 'public', or null if no access
   */
  const checkUserPermissions = useCallback(
    (dashboard: Dashboard, userEmail?: string, userId?: string) => {
      // If no user (anonymous), no access regardless of dashboard visibility
      if (!userId) {
        return null; // Changed: No longer return "anonymous" for public dashboards
      }

      // For logged in users, check permissions
      // Check if user is owner
      if (dashboard.userId === userId) {
        return "owner";
      }

      // Check if user is in editors list
      if (userEmail && dashboard.permissions?.editors?.includes(userEmail)) {
        return "editor";
      }

      // Check if user is in viewers list
      if (userEmail && dashboard.permissions?.viewers?.includes(userEmail)) {
        return "viewer";
      }

      // Check if dashboard is public - only for logged in users
      if (dashboard.permissions?.publicView) {
        return "public";
      }

      // No access
      return null;
    },
    []
  );

  // Fetch dashboard and chart data when user authentication is completed
  useEffect(() => {
    // Only proceed if user auth loading is complete
    if (isAuthLoading) return;

    const fetchDashboard = async () => {
      try {
        setIsLoading(true);

        // Require user to be logged in before attempting to load dashboard
        if (!user) {
          console.log("No user logged in, redirecting to login");
          window.location.href = `${process.env.NEXT_PUBLIC_APP_URL}/login`;
          return;
        }

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

        // If logged in user but no permission, show access error
        if (permissionLevel === null) {
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
            const chart = await loadChart(chartId);
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

    fetchDashboard();
  }, [slug, user, checkUserPermissions, isAuthLoading]); // Add isAuthLoading as a dependency

  // Update layouts ref when dashboard changes
  const handleLayoutChange = useCallback(
    (layout: any) => {
      if (isEditing) {
        tempLayoutsRef.current = layout;
        setHasUnsavedChanges(true);
      }
    },
    [isEditing]
  );

  // Memoize the dashboard object for DashboardGrid to prevent re-renders
  // Add chartUpdateCounter as dependency to ensure re-render when charts change
  const dashboardForGrid = useMemo(() => {
    if (!dashboard) return null;

    return {
      ...dashboard,
      charts: isEditing ? tempChartsRef.current : dashboard.charts,
      layout: isEditing ? tempLayoutsRef.current : dashboard.layout,
    };
  }, [dashboard, isEditing, chartUpdateCounter]);

  // Memoize chart data to prevent re-renders
  const memoizedChartData = useMemo(() => chartData, [chartData]);

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

  // Show loading state with improved UI and different messages based on what's loading
  if (isAuthLoading || isLoading) {
    return <LoadingState isAuthLoading={isAuthLoading} />;
  }

  // Show error state with improved UI
  if (error) {
    return <ErrorState error={error} />;
  }

  // Show dashboard content with improved UI
  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden pb-4">
      <DashboardHeader
        isEditing={isEditing}
        userPermission={userPermission}
        handleEdit={handleEdit}
        handleCancel={handleCancel}
        handleSave={handleSave}
        isSaving={isSaving}
        hasUnsavedChanges={hasUnsavedChanges}
        setIsManageChartsOpen={setIsManageChartsOpen}
      />

      {userPermission && userPermission !== "owner" && (
        <PermissionIndicator userPermission={userPermission} user={user} />
      )}

      {/* Make the main content area scrollable */}
      <div className="flex-grow overflow-y-auto p-4 pt-0">
        {dashboard?.charts &&
        (isEditing
          ? tempChartsRef.current.length > 0
          : dashboard.charts.length > 0) ? (
          <DashboardGrid
            key={`grid-${isEditing ? "edit" : "view"}-${chartUpdateCounter}`}
            dashboard={dashboardForGrid}
            chartData={memoizedChartData}
            isEditing={isEditing}
            onLayoutChange={handleLayoutChange}
          />
        ) : (
          <EmptyDashboardPlaceholder
            isEditing={isEditing}
            setIsManageChartsOpen={setIsManageChartsOpen}
          />
        )}
      </div>

      {/* Modals */}
      {user && dashboard && (
        <>
          <ManageChartsModal
            open={isManageChartsOpen}
            onOpenChange={setIsManageChartsOpen}
            userId={user.id}
            currentCharts={tempChartsRef.current}
            onChartsChange={handleChartsChange}
          />

          <ShareDialog
            open={isShareModalOpen}
            onOpenChange={setIsShareModalOpen}
            dashboard={dashboard}
            onUpdatePermissions={handleUpdatePermissions}
          />
        </>
      )}
    </div>
  );
}
