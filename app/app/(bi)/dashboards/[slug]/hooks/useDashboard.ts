import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import {
  loadDashboard,
  Dashboard,
  updateDashboard,
  LayoutItem,
} from "@/components/stores/dashboard_store";
import { loadChart } from "@/components/stores/chart_store";
import { ChartDocument } from "@/lib/types/stores/chart";
import { useToast } from "@/lib/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { User } from "@supabase/supabase-js"; // Re-add User import
import { useIsAuthenticated } from "@/lib/hooks/use-authenticated-query";

type Permission = "owner" | "editor" | "viewer" | "public" | "anonymous" | null;

// Define the structure returned by the queryFn, including permission and user
interface DashboardQueryResult {
  dashboard: Dashboard;
  charts: Map<string, ChartDocument | null>;
  calculatedPermission: Permission;
  user: User | null; // Add user to the query result
}

interface UseDashboardReturn {
  user: User | null; // Add user back to the return type
  dashboard: Dashboard | undefined;
  isLoading: boolean;
  isAuthLoading: boolean;
  isSaving: boolean;
  error: Error | null;
  chartData: Map<string, ChartDocument | null>;
  userPermission: Permission;
  tempTitle: string;
  tempDescription: string;
  isEditing: boolean;
  hasUnsavedChanges: boolean;
  chartUpdateCounter: number;
  tempLayoutsRef: React.MutableRefObject<LayoutItem[]>;
  tempChartsRef: React.MutableRefObject<string[]>;
  handleTitleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleDescriptionChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleEdit: () => void;
  handleSave: () => Promise<void>;
  handleCancel: () => void;
  handleLayoutChange: (layout: LayoutItem[]) => void;
  handleChartsChange: (newCharts: string[], apply: boolean) => void;
  handleUpdatePermissions: (
    newPermissions: Dashboard["permissions"]
  ) => Promise<void>;
}

// Helper function to get user email
const getUserEmail = async (
  supabaseClient: any
): Promise<string | undefined> => {
  try {
    const {
      data: { user },
      error,
    } = await supabaseClient.auth.getUser();
    if (error) throw error;
    return user?.email;
  } catch (err) {
    console.error("Error fetching user email:", err);
    return undefined;
  }
};

// Helper function to get the full user object
const getFullUser = async (supabaseClient: any): Promise<User | null> => {
  try {
    const {
      data: { user },
      error,
    } = await supabaseClient.auth.getUser();
    if (error) throw error;
    return user;
  } catch (err) {
    console.error("Error fetching full user object:", err);
    return null;
  }
};

// checkUserPermissions remains the same
const checkUserPermissions = (
  dashboard: Dashboard,
  userEmail?: string,
  userId?: string
): Permission => {
  if (!userId) {
    // If user is not logged in, check if dashboard is public
    return dashboard.permissions?.publicView ? "public" : null;
  }
  if (dashboard.userId === userId) return "owner";
  if (userEmail && dashboard.permissions?.editors?.includes(userEmail))
    return "editor";
  if (userEmail && dashboard.permissions?.viewers?.includes(userEmail))
    return "viewer";
  // If logged in but no specific permission, check if public
  if (dashboard.permissions?.publicView) return "public";
  return null; // No permission found
};

export function useDashboard(slug: string): UseDashboardReturn {
  const {
    isAuthenticated,
    isLoading: isAuthLoading,
    userId,
  } = useIsAuthenticated();

  const [userPermission, setUserPermission] = useState<Permission>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [tempTitle, setTempTitle] = useState("");
  const [tempDescription, setTempDescription] = useState("");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [chartUpdateCounter, setChartUpdateCounter] = useState(0);
  const [chartData, setChartData] = useState<Map<string, ChartDocument | null>>(
    new Map()
  );

  const tempLayoutsRef = useRef<LayoutItem[]>([]);
  const tempChartsRef = useRef<string[]>([]);

  const { toast } = useToast();
  const supabase = createClient();
  const queryClient = useQueryClient();

  // --- Data Fetching with React Query ---
  const dashboardQueryKey = ["dashboard", slug, userId];

  const {
    data: queryResult,
    isLoading: isDashboardLoading,
    error: dashboardError,
    isSuccess: isDashboardSuccess,
  } = useQuery<DashboardQueryResult, Error>({
    queryKey: dashboardQueryKey,
    queryFn: async (): Promise<DashboardQueryResult> => {
      // Fetch dashboard data, user email, AND full user object concurrently
      const [dashboardData, userEmail, fetchedUser] = await Promise.all([
        loadDashboard(slug),
        isAuthenticated ? getUserEmail(supabase) : Promise.resolve(undefined),
        isAuthenticated ? getFullUser(supabase) : Promise.resolve(null), // Fetch user object if authenticated
      ]);

      if (!dashboardData) {
        throw new Error("Dashboard not found");
      }

      const permissionLevel = checkUserPermissions(
        dashboardData,
        userEmail,
        userId ?? undefined
      );

      if (permissionLevel === null) {
        throw new Error("You don't have permission to view this dashboard");
      }

      // Load chart data associated with the dashboard
      const chartDataMap = new Map<string, ChartDocument | null>();
      if (dashboardData.charts && dashboardData.charts.length > 0) {
        const chartPromises = dashboardData.charts.map(async (chartId) => {
          try {
            const chart = await loadChart(chartId);
            return { chartId, chart };
          } catch (err) {
            console.error(`Error loading chart ${chartId}:`, err);
            return { chartId, chart: null };
          }
        });
        const chartResults = await Promise.all(chartPromises);
        chartResults.forEach(({ chartId, chart }) => {
          chartDataMap.set(chartId, chart);
        });
      }

      // Return dashboard, charts, permission, and the fetched user object
      return {
        dashboard: dashboardData,
        charts: chartDataMap,
        calculatedPermission: permissionLevel,
        user: fetchedUser, // Include the user object
      };
    },
    enabled: !isAuthLoading,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
    retry: (failureCount, error) => {
      // Don't retry on permission errors
      if (error.message.includes("permission")) {
        return false;
      }
      // Default retry behavior for other errors (e.g., network)
      return failureCount < 2;
    },
  });

  // Effect to update the local userPermission state when the query successfully completes
  useEffect(() => {
    if (isDashboardSuccess && queryResult) {
      setUserPermission(queryResult.calculatedPermission);
    }
    // Reset permission if query is loading, errored, or auth state changes significantly
    else if (isDashboardLoading || dashboardError || isAuthLoading) {
      setUserPermission(null);
    }
  }, [
    isDashboardSuccess,
    queryResult,
    isDashboardLoading,
    dashboardError,
    isAuthLoading,
  ]);

  // Extract dashboard and user data from the query result
  const dashboard = queryResult?.dashboard;
  const user = queryResult?.user; // Extract user from query result

  // Effect to sync local chartData state with fetched data
  useEffect(() => {
    if (isDashboardSuccess && queryResult?.charts) {
      if (!isEditing) {
        setChartData(new Map(queryResult.charts));
      }
    }
  }, [queryResult, isDashboardSuccess, isEditing]);

  // --- Mutations with React Query ---
  const updateDashboardMutation = useMutation({
    mutationFn: (updatedData: Partial<Dashboard>) => {
      // ... existing mutationFn logic ...
      // Use userId from useIsAuthenticated
      if (!queryResult?.dashboard || !userId)
        throw new Error("Dashboard or user ID not available for saving");
      return updateDashboard(slug, userId, updatedData); // Use userId
    },
    onSuccess: (updatedData, variables) => {
      // Invalidate the query to refetch data including permissions
      queryClient.invalidateQueries({ queryKey: dashboardQueryKey });
      toast({
        title: "Dashboard saved",
        description: "Your changes have been saved successfully.",
        duration: 3000,
      });
      setIsEditing(false);
      setHasUnsavedChanges(false);
    },
    onError: (error) => {
      // ... existing onError logic ...
      console.error("Failed to save dashboard changes:", error);
      toast({
        title: "Save failed",
        description:
          "There was an error saving your changes. Please try again.",
        variant: "destructive",
        duration: 5000,
      });
    },
  });

  const updatePermissionsMutation = useMutation({
    mutationFn: (newPermissions: Dashboard["permissions"]) => {
      // ... existing mutationFn logic ...
      // Use userId from useIsAuthenticated
      if (!queryResult?.dashboard || !userId)
        throw new Error(
          "Dashboard or user ID not available for permission update"
        );
      return updateDashboard(slug, userId, { permissions: newPermissions }); // Use userId
    },
    onSuccess: (updatedData, variables) => {
      // Invalidate the query to refetch data including permissions
      queryClient.invalidateQueries({ queryKey: dashboardQueryKey });
      toast({
        title: "Permissions updated",
        duration: 3000,
      });
    },
    onError: (error) => {
      // ... existing onError logic ...
      console.error("Failed to update dashboard permissions:", error);
      toast({
        title: "Permission update failed",
        description: "Could not update permissions. Please try again.",
        variant: "destructive",
        duration: 5000,
      });
    },
  });

  // --- Event Handlers ---

  const handleTitleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setTempTitle(e.target.value);
      setHasUnsavedChanges(true);
    },
    []
  );

  const handleDescriptionChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setTempDescription(e.target.value);
      setHasUnsavedChanges(true);
    },
    []
  );

  const handleEdit = useCallback(() => {
    const currentDashboard = queryResult?.dashboard;
    const currentCharts = queryResult?.charts; // Get charts from query result
    if (currentDashboard && currentCharts) {
      // Ensure charts are also available
      tempLayoutsRef.current = [...(currentDashboard.layout || [])];
      tempChartsRef.current = [...(currentDashboard.charts || [])];
      setTempTitle(currentDashboard.title || "Dashboard");
      setTempDescription(currentDashboard.description || "");
      // Ensure local chartData reflects the current state when starting edit
      setChartData(new Map(currentCharts)); // Use charts from query result
      setIsEditing(true);
      setHasUnsavedChanges(false);
    }
  }, [queryResult]); // Depend on queryResult

  const handleSave = useCallback(async () => {
    // ... existing save logic ...
    // Ensure it uses queryResult?.dashboard for comparisons
    const currentDashboard = queryResult?.dashboard;
    if (!currentDashboard || !userId) return; // Use userId from hook scope

    const trimmedTitle = tempTitle.trim() || "Dashboard";
    const trimmedDescription = tempDescription.trim();

    const didTitleChange = trimmedTitle !== currentDashboard.title;
    const didDescriptionChange =
      trimmedDescription !== currentDashboard.description;
    const didLayoutChange =
      JSON.stringify(tempLayoutsRef.current) !==
      JSON.stringify(currentDashboard.layout || []); // Ensure comparison with default empty array
    const didChartsChange =
      JSON.stringify(tempChartsRef.current) !==
      JSON.stringify(currentDashboard.charts || []); // Ensure comparison with default empty array

    if (
      didTitleChange ||
      didDescriptionChange ||
      didLayoutChange ||
      didChartsChange
    ) {
      updateDashboardMutation.mutate({
        title: trimmedTitle,
        description: trimmedDescription,
        layout: tempLayoutsRef.current,
        charts: tempChartsRef.current,
      });
    } else {
      setIsEditing(false);
      setHasUnsavedChanges(false);
      toast({
        title: "No changes",
        description: "No changes were detected to save.",
        duration: 2000,
      });
    }
  }, [
    queryResult,
    userId, // Use userId from hook scope
    tempTitle,
    tempDescription,
    updateDashboardMutation,
    toast,
  ]);

  const handleCancel = useCallback(() => {
    setIsEditing(false);
    setHasUnsavedChanges(false);
    // Reset local chart data state to reflect the last fetched data
    if (queryResult?.charts) {
      setChartData(new Map(queryResult.charts));
    }
    // Reset temp refs based on the fetched dashboard data
    const currentDashboard = queryResult?.dashboard;
    if (currentDashboard) {
      tempLayoutsRef.current = currentDashboard.layout || [];
      tempChartsRef.current = currentDashboard.charts || [];
      // Also reset temp title/description if needed
      setTempTitle(currentDashboard.title || "Dashboard");
      setTempDescription(currentDashboard.description || "");
    }

    toast({
      title: "Changes discarded",
      description: "Editing cancelled.",
      duration: 3000,
    });
  }, [queryResult, toast]); // Depend on queryResult

  const handleLayoutChange = useCallback(
    (layout: LayoutItem[]) => {
      if (isEditing) {
        if (JSON.stringify(layout) !== JSON.stringify(tempLayoutsRef.current)) {
          tempLayoutsRef.current = layout;
          setHasUnsavedChanges(true);
        }
      }
    },
    [isEditing]
  );

  const handleChartsChange = useCallback(
    // ... existing handleChartsChange logic ...
    // Ensure it uses tempLayoutsRef.current and tempChartsRef.current correctly
    // and updates local chartData state as before.
    (newCharts: string[], apply: boolean) => {
      if (apply && isEditing) {
        const currentChartsSet = new Set(tempChartsRef.current);
        const newChartsSet = new Set(newCharts);

        const addedCharts = newCharts.filter((id) => !currentChartsSet.has(id));
        const removedCharts = tempChartsRef.current.filter(
          (id) => !newChartsSet.has(id)
        );

        if (addedCharts.length === 0 && removedCharts.length === 0) {
          // No actual change in charts
          return;
        }

        // Update charts reference
        tempChartsRef.current = newCharts;

        // Clean up layouts: Remove layouts for removed charts
        tempLayoutsRef.current = tempLayoutsRef.current.filter((item) =>
          newChartsSet.has(item.i)
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
            x: (index * 6) % 12,
            y: maxY + Math.floor((index * 6) / 12) * 9,
            w: 6,
            h: 9,
            minW: 3,
            minH: 3,
          }));

          tempLayoutsRef.current = [
            ...tempLayoutsRef.current,
            ...newLayoutItems,
          ];

          const loadNewChartData = async () => {
            const newChartDataMap = new Map(chartData);
            for (const chartId of addedCharts) {
              if (!newChartDataMap.has(chartId)) {
                try {
                  const chart = await loadChart(chartId);
                  newChartDataMap.set(chartId, chart);
                } catch (err) {
                  console.error(`Failed to load chart ${chartId}:`, err);
                  newChartDataMap.set(chartId, null);
                }
              }
            }
            setChartData(newChartDataMap);
          };
          loadNewChartData(); // No need to check addedCharts.length > 0 here
        }

        // Remove chart data for removed charts from local state
        if (removedCharts.length > 0) {
          setChartData((prevMap) => {
            const newMap = new Map(prevMap);
            removedCharts.forEach((id) => newMap.delete(id));
            return newMap;
          });
        }

        setChartUpdateCounter((prev) => prev + 1);
        setHasUnsavedChanges(true);

        let message = "";
        if (addedCharts.length > 0)
          message += `Added ${addedCharts.length} chart${
            addedCharts.length !== 1 ? "s" : ""
          }. `;
        if (removedCharts.length > 0)
          message += `Removed ${removedCharts.length} chart${
            removedCharts.length !== 1 ? "s" : ""
          }.`;
        toast({
          title: "Charts updated (unsaved)",
          description: message.trim(),
          duration: 3000,
        });
      }
    },
    [isEditing, chartData, toast] // Keep chartData dependency
  );

  const handleUpdatePermissions = useCallback(
    async (newPermissions: Dashboard["permissions"]) => {
      // ... existing update permissions logic ...
      // Ensure it uses queryResult?.dashboard
      const currentDashboard = queryResult?.dashboard;
      if (!currentDashboard || !userId) return; // Use userId from hook scope
      await updatePermissionsMutation.mutateAsync(newPermissions);
    },
    [queryResult, userId, updatePermissionsMutation] // Use userId from hook scope
  );

  // --- Return Values ---
  return {
    user: user ?? null, // Return the user object, defaulting undefined to null
    dashboard,
    isLoading: isAuthLoading || isDashboardLoading,
    isAuthLoading,
    isSaving:
      updateDashboardMutation.isPending || updatePermissionsMutation.isPending,
    error: dashboardError,
    chartData,
    userPermission,
    tempTitle,
    tempDescription,
    isEditing,
    hasUnsavedChanges,
    chartUpdateCounter,
    tempLayoutsRef,
    tempChartsRef,
    handleTitleChange,
    handleDescriptionChange,
    handleEdit,
    handleSave,
    handleCancel,
    handleLayoutChange,
    handleChartsChange,
    handleUpdatePermissions,
  };
}
