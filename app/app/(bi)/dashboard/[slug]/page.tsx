"use client";
import React, { useState, useEffect, useCallback, useRef, memo } from "react";
import { createClient } from "@/utils/supabase/client";
import {
  loadDashboard,
  Dashboard,
  LayoutItem,
  updateDashboard,
} from "@/components/stores/dashboard_store";
import { Loader2, PencilRuler } from "lucide-react";
import { DynamicChart } from "@/components/BI/AgentResult/dynamic-chartjs";
import { loadChart } from "@/lib/actions/chartActions";
import { Responsive, WidthProvider } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { Button } from "@/components/ui/button";
import { Expand, Grip } from "lucide-react";
import { Input } from "@/components/ui/input";

// Create a memoized grid component to prevent re-renders when title changes
const MemoizedGridLayout = memo(
  ({
    dashboard,
    chartData,
    isEditing,
    tempLayoutsRef,
    handleLayoutChange,
  }: {
    dashboard: Dashboard;
    chartData: Map<string, any>;
    isEditing: boolean;
    tempLayoutsRef: React.MutableRefObject<LayoutItem[]>;
    handleLayoutChange: (layout: any) => void;
  }) => {
    const ResponsiveGridLayout = WidthProvider(Responsive);
    console.log("Grid layout rendering");

    return (
      <div className="relative">
        <ResponsiveGridLayout
          className="layout"
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480 }}
          cols={{ lg: 12, md: 12, sm: 12, xs: 12 }}
          rowHeight={30}
          draggableHandle=".drag-handle"
          isDraggable={isEditing}
          isResizable={isEditing}
          onLayoutChange={handleLayoutChange}
          layouts={{
            lg: isEditing ? tempLayoutsRef.current : dashboard.layout,
          }}
          compactType="vertical"
          preventCollision={false}
          allowOverlap={false}
          useCSSTransforms={true}
          verticalCompact={true}
          resizeHandles={isEditing ? ["se"] : []}
          margin={[10, 10]}
          containerPadding={[5, 5]}
        >
          {dashboard.charts.map((chartId) => {
            const chart = chartData.get(chartId);
            return (
              <div
                key={chartId}
                className={`border rounded-lg ${
                  isEditing ? "border-primary/50 shadow-md" : ""
                }`}
              >
                {isEditing && (
                  <div className="drag-handle bg-primary/10 text-xs p-1 text-center cursor-move">
                    <Grip className="inline-block mr-1" /> Drag to move
                  </div>
                )}
                <div className="p-4 h-[calc(100%-24px)]">
                  {chart?.visualization ? (
                    <DynamicChart
                      config={chart.visualization}
                      className="w-full h-full"
                    />
                  ) : (
                    <div className="text-center py-12 bg-muted/50 rounded-lg">
                      <p className="text-lg text-muted-foreground">
                        {chart?.type === "chart"
                          ? "No visualization available"
                          : "This is a placeholder for value type chart"}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </ResponsiveGridLayout>
      </div>
    );
  },
  // Custom equality function to prevent unnecessary rerenders
  (prevProps, nextProps) => {
    // Only rerender if these props change
    return (
      prevProps.isEditing === nextProps.isEditing &&
      prevProps.dashboard === nextProps.dashboard &&
      prevProps.chartData === nextProps.chartData
    );
  }
);

MemoizedGridLayout.displayName = "MemoizedGridLayout";

// Memoize title component to prevent re-renders when layout changes
const TitleEditor = memo(
  ({
    isEditing,
    title,
    tempTitle,
    onTitleChange,
  }: {
    isEditing: boolean;
    title: string;
    tempTitle: string;
    onTitleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  }) => {
    const titleInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
      if (isEditing && titleInputRef.current) {
        titleInputRef.current.focus();
      }
    }, [isEditing]);

    console.log("Title editor rendering");

    return isEditing ? (
      <Input
        ref={titleInputRef}
        type="text"
        value={tempTitle}
        onChange={onTitleChange}
        className="text-2xl font-bold h-auto py-1"
        placeholder="Dashboard Title"
      />
    ) : (
      <h1 className="text-2xl font-bold">{title || "Dashboard"}</h1>
    );
  }
);

TitleEditor.displayName = "TitleEditor";

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

  // State for title editing
  const [tempTitle, setTempTitle] = useState("");

  // Use ref for layouts to prevent re-rendering
  const tempLayoutsRef = useRef<LayoutItem[]>([]);

  const supabase = createClient();
  console.log("Main component rendering");

  // Memoize the layout change handler to prevent unnecessary re-renders
  const handleLayoutChange = useCallback(
    (_currentLayout: any) => {
      // Only update the ref, not state, to avoid re-render
      if (isEditing) {
        tempLayoutsRef.current = _currentLayout;
      }
    },
    [isEditing]
  );

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
    // Set the temporary title when entering edit mode
    setTempTitle(dashboard?.title || "Dashboard");
    setIsEditing(true);
  }, [dashboard]);

  const handleSave = useCallback(async () => {
    if (!dashboard || !user) return;

    const trimmedTitle = tempTitle.trim() || "Dashboard";

    setIsLoading(true);
    try {
      // Save both layout and title changes
      await updateDashboard(slug, user.id, {
        title: trimmedTitle,
        layout: tempLayoutsRef.current,
      });

      // Update the local dashboard state
      setDashboard((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          title: trimmedTitle,
          layout: tempLayoutsRef.current,
        };
      });

      console.log("Dashboard updated successfully");
    } catch (err) {
      console.error("Failed to save dashboard changes:", err);
    } finally {
      setIsLoading(false);
      setIsEditing(false);
    }
  }, [dashboard, user, slug, tempTitle]);

  const handleCancel = useCallback(() => {
    // Reset temporary values when cancelling
    tempLayoutsRef.current = dashboard?.layout || [];
    setTempTitle(dashboard?.title || "Dashboard");
    setIsEditing(false);
  }, [dashboard]);

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
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button onClick={handleSave}>Save</Button>
            </div>
          )}
        </div>
      </div>

      {dashboard?.charts && dashboard.charts.length > 0 ? (
        <MemoizedGridLayout
          dashboard={dashboard}
          chartData={chartData}
          isEditing={isEditing}
          tempLayoutsRef={tempLayoutsRef}
          handleLayoutChange={handleLayoutChange}
        />
      ) : (
        <div className="text-center py-12 bg-muted/50 rounded-lg">
          <p className="text-lg text-muted-foreground">
            This dashboard doesn't have any charts yet
          </p>
        </div>
      )}
    </div>
  );
}
