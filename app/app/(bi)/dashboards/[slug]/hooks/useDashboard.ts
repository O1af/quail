import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import {
  loadDashboard,
  Dashboard,
  updateDashboard,
} from "@/components/stores/dashboard_store";
import { loadChart } from "@/components/stores/chart_store";
import { ChartDocument } from "@/lib/types/stores/chart";
import { useToast } from "@/lib/hooks/use-toast";

type Permission = "owner" | "editor" | "viewer" | "public" | "anonymous" | null;

interface UseDashboardReturn {
  user: any;
  dashboard: Dashboard | null;
  isLoading: boolean;
  isAuthLoading: boolean;
  isSaving: boolean;
  error: string | null;
  chartData: Map<string, ChartDocument | null>;
  userPermission: Permission;
  tempTitle: string;
  tempDescription: string;
  isEditing: boolean;
  hasUnsavedChanges: boolean;
  chartUpdateCounter: number;
  tempLayoutsRef: React.MutableRefObject<any[]>;
  tempChartsRef: React.MutableRefObject<string[]>;
  handleTitleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleDescriptionChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleEdit: () => void;
  handleSave: () => Promise<void>;
  handleCancel: () => void;
  handleLayoutChange: (layout: any) => void;
  handleChartsChange: (newCharts: string[], apply: boolean) => void;
  handleUpdatePermissions: (
    newPermissions: Dashboard["permissions"]
  ) => Promise<void>;
}

export function useDashboard(slug: string): UseDashboardReturn {
  const [user, setUser] = useState<any>(null);
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chartData, setChartData] = useState<Map<string, ChartDocument | null>>(
    new Map()
  );
  const [userPermission, setUserPermission] = useState<Permission>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [tempTitle, setTempTitle] = useState("");
  const [tempDescription, setTempDescription] = useState("");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [chartUpdateCounter, setChartUpdateCounter] = useState(0);

  const tempLayoutsRef = useRef<any[]>([]);
  const tempChartsRef = useRef<string[]>([]);

  const { toast } = useToast();
  const supabase = createClient();

  // Title change handler
  const handleTitleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setTempTitle(e.target.value);
    },
    []
  );

  // Description change handler
  const handleDescriptionChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setTempDescription(e.target.value);
    },
    []
  );

  // Start editing
  const handleEdit = useCallback(() => {
    if (dashboard?.layout) {
      tempLayoutsRef.current = [...dashboard.layout];
    }
    if (dashboard?.charts) {
      tempChartsRef.current = [...dashboard.charts];
    }
    setTempTitle(dashboard?.title || "Dashboard");
    setTempDescription(dashboard?.description || "");
    setIsEditing(true);
    setHasUnsavedChanges(false);
  }, [dashboard]);

  // Save changes
  const handleSave = useCallback(async () => {
    if (!dashboard || !user) return;

    const trimmedTitle = tempTitle.trim() || "Dashboard";
    const trimmedDescription = tempDescription.trim();

    setIsSaving(true);
    try {
      await updateDashboard(slug, dashboard.userId, {
        title: trimmedTitle,
        description: trimmedDescription,
        layout: tempLayoutsRef.current,
        charts: tempChartsRef.current,
      });

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

      // Update chart data for newly added charts
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

  // Cancel editing
  const handleCancel = useCallback(() => {
    // if (hasUnsavedChanges) {
    //   const confirmed = window.confirm(
    //     "You have unsaved changes. Are you sure you want to discard them?"
    //   );
    //   if (!confirmed) return;
    // }

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
  }, [dashboard, toast]);

  // Update layout
  const handleLayoutChange = useCallback(
    (layout: any) => {
      if (isEditing) {
        tempLayoutsRef.current = layout;
        setHasUnsavedChanges(true);
      }
    },
    [isEditing]
  );

  // Chart management
  const handleChartsChange = useCallback(
    (newCharts: string[], apply: boolean) => {
      if (apply) {
        const existingChartIds = new Set(tempChartsRef.current);
        const addedCharts = newCharts.filter(
          (chartId) => !existingChartIds.has(chartId)
        );

        // Update charts reference
        tempChartsRef.current = newCharts;

        // Clean up layouts
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

          // Load data for new charts
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

  // Permission management
  const checkUserPermissions = useCallback(
    (dashboard: Dashboard, userEmail?: string, userId?: string): Permission => {
      if (!userId) return null;

      if (dashboard.userId === userId) return "owner";

      if (userEmail && dashboard.permissions?.editors?.includes(userEmail))
        return "editor";

      if (userEmail && dashboard.permissions?.viewers?.includes(userEmail))
        return "viewer";

      if (dashboard.permissions?.publicView) return "public";

      return null;
    },
    []
  );

  const handleUpdatePermissions = useCallback(
    async (newPermissions: Dashboard["permissions"]) => {
      if (!dashboard || !user) return;

      setIsLoading(true);
      try {
        await updateDashboard(slug, user.id, {
          permissions: newPermissions,
        });

        setDashboard((prev) => {
          if (!prev) return null;
          return { ...prev, permissions: newPermissions };
        });
      } catch (err) {
        console.error("Failed to update dashboard permissions:", err);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [dashboard, user, slug]
  );

  // Fetch user
  useEffect(() => {
    const fetchUser = async () => {
      setIsAuthLoading(true);
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        setUser(user);
      } catch (err) {
        console.error("Error fetching user:", err);
      } finally {
        setIsAuthLoading(false);
      }
    };

    fetchUser();
  }, [supabase]);

  // Fetch dashboard data
  useEffect(() => {
    if (isAuthLoading) return;

    const fetchDashboard = async () => {
      try {
        setIsLoading(true);

        if (!user) {
          window.location.href = `${process.env.NEXT_PUBLIC_APP_URL}/login`;
          return;
        }

        const dashboardData = await loadDashboard(slug);

        if (!dashboardData) {
          setError("Dashboard not found");
          setIsLoading(false);
          return;
        }

        const permissionLevel = checkUserPermissions(
          dashboardData,
          user.email,
          user.id
        );

        if (permissionLevel === null) {
          setError("You don't have permission to view this dashboard");
          setIsLoading(false);
          return;
        }

        setUserPermission(permissionLevel);
        setDashboard(dashboardData);

        if (permissionLevel !== "owner" && permissionLevel !== "editor") {
          setIsEditing(false);
        }

        // Load chart data
        const chartDataMap = new Map<string, ChartDocument | null>();

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

        setChartData(chartDataMap);
      } catch (err) {
        console.error("Error loading dashboard:", err);
        setError("Failed to load dashboard");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboard();
  }, [slug, user, checkUserPermissions, isAuthLoading]);

  return {
    user,
    dashboard,
    isLoading,
    isAuthLoading,
    isSaving,
    error,
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
