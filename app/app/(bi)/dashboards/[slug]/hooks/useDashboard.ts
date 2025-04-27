import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import {
  loadDashboard,
  Dashboard,
  updateDashboard,
  LayoutItem, // Import LayoutItem type
} from "@/components/stores/dashboard_store";
import { loadChart } from "@/components/stores/chart_store";
import { ChartDocument } from "@/lib/types/stores/chart";
import { useToast } from "@/lib/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { User } from "@supabase/supabase-js";
import { useIsAuthenticated } from "@/lib/hooks/use-authenticated-query"; // Import useIsAuthenticated

type Permission = "owner" | "editor" | "viewer" | "public" | "anonymous" | null;

// Define the structure returned by the queryFn
interface DashboardQueryResult {
  dashboard: Dashboard;
  charts: Map<string, ChartDocument | null>;
}

interface UseDashboardReturn {
  user: User | null; // Keep user state for now, though useIsAuthenticated provides ID
  dashboard: Dashboard | undefined; // Data from query
  isLoading: boolean; // Combined loading state
  isAuthLoading: boolean; // From useIsAuthenticated
  isSaving: boolean; // Keep for mutation pending state
  error: Error | null; // Use Error type from React Query
  chartData: Map<string, ChartDocument | null>; // Local state, synced with query
  userPermission: Permission;
  tempTitle: string;
  tempDescription: string;
  isEditing: boolean;
  hasUnsavedChanges: boolean;
  chartUpdateCounter: number;
  tempLayoutsRef: React.MutableRefObject<LayoutItem[]>; // Use LayoutItem[]
  tempChartsRef: React.MutableRefObject<string[]>;
  handleTitleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleDescriptionChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleEdit: () => void;
  handleSave: () => Promise<void>;
  handleCancel: () => void;
  handleLayoutChange: (layout: LayoutItem[]) => void; // Use LayoutItem[]
  handleChartsChange: (newCharts: string[], apply: boolean) => void;
  handleUpdatePermissions: (
    newPermissions: Dashboard["permissions"]
  ) => Promise<void>;
}

// Helper function to check permissions (can be moved outside if preferred)
const checkUserPermissions = (
  dashboard: Dashboard,
  userEmail?: string,
  userId?: string
): Permission => {
  if (!userId) return null;
  if (dashboard.userId === userId) return "owner";
  if (userEmail && dashboard.permissions?.editors?.includes(userEmail))
    return "editor";
  if (userEmail && dashboard.permissions?.viewers?.includes(userEmail))
    return "viewer";
  if (dashboard.permissions?.publicView) return "public";
  return null;
};

export function useDashboard(slug: string): UseDashboardReturn {
  // Still keep user state if needed for email/metadata, though ID comes from useIsAuthenticated
  const [user, setUser] = useState<User | null>(null);
  const {
    isAuthenticated,
    isLoading: isAuthLoading,
    userId,
  } = useIsAuthenticated(); // Use the hook

  const [userPermission, setUserPermission] = useState<Permission>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [tempTitle, setTempTitle] = useState("");
  const [tempDescription, setTempDescription] = useState("");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [chartUpdateCounter, setChartUpdateCounter] = useState(0);
  const [chartData, setChartData] = useState<Map<string, ChartDocument | null>>(
    new Map()
  );

  const tempLayoutsRef = useRef<LayoutItem[]>([]); // Use LayoutItem[]
  const tempChartsRef = useRef<string[]>([]);

  const { toast } = useToast();
  const supabase = createClient(); // Keep for fetching full user object if needed
  const queryClient = useQueryClient();

  // --- User Authentication ---
  // Fetch full user object once authenticated (optional, if needed beyond ID/email)
  useEffect(() => {
    const fetchFullUser = async () => {
      if (isAuthenticated) {
        try {
          const {
            data: { user: fetchedUser },
          } = await supabase.auth.getUser();
          setUser(fetchedUser); // Store the full user object
        } catch (err) {
          console.error("Error fetching full user object:", err);
          setUser(null);
        }
      } else {
        setUser(null); // Clear user if not authenticated
      }
    };
    fetchFullUser();
  }, [isAuthenticated, supabase]);

  // --- Data Fetching with React Query ---
  const dashboardQueryKey = ["dashboard", slug];

  const {
    data: queryResult,
    isLoading: isDashboardLoading,
    error: dashboardError,
    isSuccess: isDashboardSuccess,
  } = useQuery<DashboardQueryResult, Error>({
    queryKey: dashboardQueryKey,
    queryFn: async (): Promise<DashboardQueryResult> => {
      // userId is guaranteed by the 'enabled' flag
      if (!userId) throw new Error("User not authenticated");

      const dashboardData = await loadDashboard(slug);
      if (!dashboardData) {
        throw new Error("Dashboard not found");
      }

      // Fetch user email if needed for permissions check (can be optimized)
      const userEmail = user?.email; // Get email from the fetched user state

      const permissionLevel = checkUserPermissions(
        dashboardData,
        userEmail, // Pass email
        userId // Pass ID from useIsAuthenticated
      );

      if (permissionLevel === null) {
        throw new Error("You don't have permission to view this dashboard");
      }

      setUserPermission(permissionLevel);

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
      // Return both dashboard and chart data
      return { dashboard: dashboardData, charts: chartDataMap };
    },
    // Enable only when authentication check is complete and successful
    enabled: isAuthenticated === true,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
    retry: 1,
  });

  // Extract dashboard data from the query result
  const dashboard = queryResult?.dashboard;

  // Effect to sync local chartData state with fetched data from React Query
  useEffect(() => {
    if (isDashboardSuccess && queryResult?.charts) {
      // Only update local state if not currently editing to avoid overwriting temp changes
      if (!isEditing) {
        setChartData(new Map(queryResult.charts)); // Create a new map instance
      }
    }
  }, [queryResult, isDashboardSuccess, isEditing]); // Add isEditing dependency

  // --- Mutations with React Query ---
  const updateDashboardMutation = useMutation({
    mutationFn: (updatedData: Partial<Dashboard>) => {
      const currentDashboard = queryResult?.dashboard;
      // Use userId from useIsAuthenticated
      if (!currentDashboard || !userId)
        throw new Error("Dashboard or user ID not available for saving");
      return updateDashboard(slug, userId, updatedData); // Use userId
    },
    onSuccess: (updatedData, variables) => {
      queryClient.invalidateQueries({ queryKey: dashboardQueryKey });
      toast({
        title: "Dashboard saved",
        description: "Your changes have been saved successfully.",
        duration: 3000,
      });
      setIsEditing(false);
      setHasUnsavedChanges(false);
      // No need to manually update chartData state here, invalidation handles it.
    },
    onError: (error) => {
      console.error("Failed to save dashboard changes:", error);
      toast({
        title: "Save failed",
        description:
          "There was an error saving your changes. Please try again.",
        variant: "destructive",
        duration: 5000,
      });
      // Optionally: Rollback optimistic update if implemented
      // queryClient.invalidateQueries({ queryKey: dashboardQueryKey });
    },
  });

  const updatePermissionsMutation = useMutation({
    mutationFn: (newPermissions: Dashboard["permissions"]) => {
      const currentDashboard = queryResult?.dashboard;
      // Use userId from useIsAuthenticated
      if (!currentDashboard || !userId)
        throw new Error(
          "Dashboard or user ID not available for permission update"
        );
      return updateDashboard(slug, userId, { permissions: newPermissions }); // Use userId
    },
    onSuccess: (updatedData, variables) => {
      queryClient.invalidateQueries({ queryKey: dashboardQueryKey });
      toast({
        title: "Permissions updated",
        duration: 3000,
      });
    },
    onError: (error) => {
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
      setHasUnsavedChanges(true); // Mark changes when title is edited
    },
    []
  );

  const handleDescriptionChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setTempDescription(e.target.value);
      setHasUnsavedChanges(true); // Mark changes when description is edited
    },
    []
  );

  const handleEdit = useCallback(() => {
    // Use dashboard from the query result for initialization
    const currentDashboard = queryResult?.dashboard;
    if (currentDashboard) {
      tempLayoutsRef.current = [...(currentDashboard.layout || [])];
      tempChartsRef.current = [...(currentDashboard.charts || [])];
      setTempTitle(currentDashboard.title || "Dashboard");
      setTempDescription(currentDashboard.description || "");
      // Ensure local chartData reflects the current state when starting edit
      setChartData(new Map(queryResult?.charts || []));
      setIsEditing(true);
      setHasUnsavedChanges(false);
    }
  }, [queryResult]); // Depend on queryResult

  const handleSave = useCallback(async () => {
    const currentDashboard = queryResult?.dashboard;
    // Use userId from useIsAuthenticated
    if (!currentDashboard || !userId) return;

    const trimmedTitle = tempTitle.trim() || "Dashboard";
    const trimmedDescription = tempDescription.trim();

    // Compare against the dashboard data from the query result
    const didTitleChange = trimmedTitle !== currentDashboard.title;
    const didDescriptionChange =
      trimmedDescription !== currentDashboard.description;
    const didLayoutChange =
      JSON.stringify(tempLayoutsRef.current) !==
      JSON.stringify(currentDashboard.layout);
    const didChartsChange =
      JSON.stringify(tempChartsRef.current) !==
      JSON.stringify(currentDashboard.charts);

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
    userId, // Use userId
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
    // Optionally reset temp refs if needed before next edit
    const currentDashboard = queryResult?.dashboard;
    if (currentDashboard) {
      tempLayoutsRef.current = currentDashboard.layout || [];
      tempChartsRef.current = currentDashboard.charts || [];
    }

    toast({
      title: "Changes discarded",
      description: "Editing cancelled.",
      duration: 3000,
    });
  }, [queryResult, toast]); // Depend on queryResult

  const handleLayoutChange = useCallback(
    (layout: LayoutItem[]) => {
      // Use LayoutItem[]
      if (isEditing) {
        // Check if layout actually changed compared to the ref
        if (JSON.stringify(layout) !== JSON.stringify(tempLayoutsRef.current)) {
          tempLayoutsRef.current = layout;
          setHasUnsavedChanges(true);
        }
      }
    },
    [isEditing]
  );

  // handleChartsChange remains largely the same, operating on the local chartData state
  const handleChartsChange = useCallback(
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
            x: (index * 6) % 12, // Basic positioning
            y: maxY + Math.floor((index * 6) / 12) * 9,
            w: 6, // Default width
            h: 9, // Default height
            minW: 3,
            minH: 3,
          }));

          tempLayoutsRef.current = [
            ...tempLayoutsRef.current,
            ...newLayoutItems,
          ];

          // Load data for new charts immediately into local state
          const loadNewChartData = async () => {
            // Use the current local chartData state
            const newChartDataMap = new Map(chartData);
            for (const chartId of addedCharts) {
              if (!newChartDataMap.has(chartId)) {
                // Avoid reloading if already present
                try {
                  const chart = await loadChart(chartId);
                  newChartDataMap.set(chartId, chart);
                } catch (err) {
                  console.error(`Failed to load chart ${chartId}:`, err);
                  newChartDataMap.set(chartId, null);
                }
              }
            }
            setChartData(newChartDataMap); // Update local state
          };
          if (addedCharts.length > 0) {
            loadNewChartData();
          }
        }

        // Remove chart data for removed charts from local state
        if (removedCharts.length > 0) {
          setChartData((prevMap) => {
            const newMap = new Map(prevMap);
            removedCharts.forEach((id) => newMap.delete(id));
            return newMap;
          });
        }

        setChartUpdateCounter((prev) => prev + 1); // Trigger grid re-render if needed
        setHasUnsavedChanges(true); // Mark changes

        // Notify user
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
    [isEditing, chartData, toast] // Keep chartData dependency for local updates
  );

  const handleUpdatePermissions = useCallback(
    async (newPermissions: Dashboard["permissions"]) => {
      const currentDashboard = queryResult?.dashboard;
      // Use userId from useIsAuthenticated
      if (!currentDashboard || !userId) return;
      await updatePermissionsMutation.mutateAsync(newPermissions);
    },
    [queryResult, userId, updatePermissionsMutation] // Use userId
  );

  // --- Return Values ---
  return {
    user, // Return the full user object if needed
    dashboard,
    isLoading: isAuthLoading || isDashboardLoading, // Combined loading
    isAuthLoading, // Expose auth loading state
    isSaving: updateDashboardMutation.isPending,
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
