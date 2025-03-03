"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import {
  loadDashboard,
  Dashboard,
  updateDashboard,
} from "@/components/stores/dashboard_store";
import { Loader2, PencilRuler, LayoutGrid } from "lucide-react";
import { loadChart } from "@/components/stores/chartActions";
import { Button } from "@/components/ui/button";

import { DashboardGrid } from "@/app/app/(bi)/dashboard/[slug]/components/DashboardGrid";
import { TitleEditor } from "./components/TitleEditor";
import { ManageChartsModal } from "./components/ManageChartsModal";

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
  const [chartData, setChartData] = useState<Map<string, any>>(new Map());

  // State for manage charts modal
  const [isManageChartsOpen, setIsManageChartsOpen] = useState(false);

  // State for title editing
  const [tempTitle, setTempTitle] = useState("");

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

  const handleEdit = useCallback(() => {
    // Initialize tempLayouts with current dashboard layout when editing starts
    if (dashboard?.layout) {
      tempLayoutsRef.current = [...dashboard.layout];
    }
    // Initialize tempCharts with current dashboard charts
    if (dashboard?.charts) {
      tempChartsRef.current = [...dashboard.charts];
    }
    // Set the temporary title when entering edit mode
    setTempTitle(dashboard?.title || "Dashboard");
    setIsEditing(true);
  }, [dashboard]);

  const handleSave = useCallback(async () => {
    if (!dashboard || !user) return;

    const trimmedTitle = tempTitle.trim() || "Dashboard";

    setIsLoading(true);
    try {
      // Save title, layout and charts changes
      await updateDashboard(slug, user.id, {
        title: trimmedTitle,
        layout: tempLayoutsRef.current,
        charts: tempChartsRef.current,
      });

      // Update the local dashboard state
      setDashboard((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          title: trimmedTitle,
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
          const chart = await loadChart(user.id, chartId);
          newChartDataMap.set(chartId, chart);
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
  }, [dashboard, user, slug, tempTitle, chartData]);

  const handleCancel = useCallback(() => {
    // Reset temporary values when cancelling
    tempLayoutsRef.current = dashboard?.layout || [];
    tempChartsRef.current = dashboard?.charts || [];
    setTempTitle(dashboard?.title || "Dashboard");
    setIsEditing(false);
  }, [dashboard]);

  // Chart management handler - updated to handle apply/cancel
  const handleChartsChange = useCallback(
    (newCharts: string[], apply: boolean) => {
      console.log(
        "Charts changed:",
        newCharts,
        apply ? "(applied)" : "(cancelled)"
      );

      if (apply) {
        tempChartsRef.current = newCharts;

        // Clean up layouts to remove any charts that were removed
        tempLayoutsRef.current = tempLayoutsRef.current.filter((item) =>
          newCharts.includes(item.i)
        );
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

  // Fetch dashboard and chart data when user is loaded
  useEffect(() => {
    const fetchDashboard = async () => {
      if (!user) return;

      try {
        setIsLoading(true);
        const dashboardData = await loadDashboard(slug, user.id);
        setDashboard(dashboardData);

        if (!dashboardData) {
          setError("Dashboard not found or you don't have access");
        } else {
          const chartDataMap = new Map<string, any>();
          for (const chartId of dashboardData.charts) {
            const chart = await loadChart(user.id, chartId);
            chartDataMap.set(chartId, chart); //add chart to map
          }
          console.log("Chart data map:", chartDataMap);
          setChartData(chartDataMap); //set chart data
        }
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
  }, [slug, user]);

  // Update layouts ref when dashboard changes
  const handleLayoutChange = useCallback(
    (layout: any) => {
      if (isEditing) {
        tempLayoutsRef.current = layout;
      }
    },
    [isEditing]
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
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex-1 max-w-md">
          <TitleEditor
            isEditing={isEditing}
            title={dashboard?.title || "Dashboard"}
            tempTitle={tempTitle}
            onTitleChange={handleTitleChange}
          />
        </div>
        <div className="flex gap-2">
          {!isEditing ? (
            <Button
              variant="secondary"
              onClick={handleEdit}
              className="ml-auto"
            >
              <PencilRuler className="mr-2 h-4 w-4" /> Edit
            </Button>
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
    </div>
  );
}
