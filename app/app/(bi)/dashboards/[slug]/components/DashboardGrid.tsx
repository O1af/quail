import React, { memo, useEffect, useMemo, useState, useCallback } from "react";
import { Responsive, WidthProvider } from "react-grid-layout";
import { Dashboard } from "@/components/stores/dashboard_store";
import { ChartItem } from "@/app/app/(bi)/dashboards/[slug]/components/ChartItem";
import { ChartEditSidebar } from "@/app/app/(bi)/dashboards/[slug]/components/ChartEditSidebar";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { Expand } from "lucide-react";

interface DashboardGridProps {
  dashboard: Dashboard;
  chartData: Map<string, any>;
  isEditing: boolean;
  onLayoutChange: (layout: any) => void;
  userId: string;
  onChartDataChange?: (chartId: string, updates: any) => void;
}

// Initialize the WidthProvider outside the component to avoid re-creation
const ResponsiveGridLayout = WidthProvider(Responsive);

export const DashboardGrid = memo(
  ({
    dashboard,
    chartData,
    isEditing,
    onLayoutChange,
    userId,
    onChartDataChange,
  }: DashboardGridProps) => {
    // Add state to track the selected chart
    const [selectedChartId, setSelectedChartId] = useState<string | null>(null);

    // Add state to track local chart data changes
    const [localChartData, setLocalChartData] =
      useState<Map<string, any>>(chartData);

    // Update local chart data when chartData prop changes
    useEffect(() => {
      setLocalChartData(new Map(chartData));
    }, [chartData]);

    // Add state to track if a drag operation is in progress
    const [isDragging, setIsDragging] = useState(false);

    // Use useMemo for layouts to prevent recreating the object on every render
    const layouts = useMemo(
      () => ({
        lg: dashboard?.layout || [],
      }),
      [dashboard?.layout]
    );

    // Check if user owns the selected chart
    const isChartOwner = useMemo(() => {
      if (!selectedChartId) return false;
      const someChartData = localChartData.get(selectedChartId);
      const chartOwnerId = someChartData?.userId;

      // Log chart ownership info for debugging
      console.log("Chart Owner ID:", chartOwnerId, "Current User ID:", userId);

      return chartOwnerId === userId;
    }, [selectedChartId, localChartData, userId]);

    // Handle chart update - propagate up and update local state
    const handleChartUpdate = useCallback(
      (chartId: string, updates: any) => {
        // Update local state
        setLocalChartData((prevData) => {
          const newData = new Map(prevData);
          const chartToUpdate = newData.get(chartId);

          if (chartToUpdate) {
            newData.set(chartId, {
              ...chartToUpdate,
              ...updates,
            });
          }

          return newData;
        });

        // Propagate changes to parent components
        if (onChartDataChange) {
          onChartDataChange(chartId, updates);
        }
      },
      [onChartDataChange]
    );

    // Handle background click to deselect chart
    const handleBackgroundClick = () => {
      if (isEditing && selectedChartId) {
        setSelectedChartId(null);
      }
    };

    // Only render if dashboard is available
    if (!dashboard) {
      return <div>Loading dashboard...</div>;
    }

    // Get the selected chart data
    const selectedChartData = selectedChartId
      ? localChartData.get(selectedChartId)
      : null;

    // Determine if sidebar is open
    const isSidebarOpen = isEditing && !!selectedChartId && !isDragging;

    // Customize onLayoutChange to detect drag operations
    const handleLayoutChange = (layout: any) => {
      // Call original handler
      onLayoutChange(layout);

      // If we're currently dragging, don't select charts
      if (isDragging) {
        // Clear selection after drag completes
        setSelectedChartId(null);
      }
    };

    return (
      <div className="flex flex-row h-full mb-24 pb-32">
        {/* Main dashboard area with transition */}
        <div
          className={`relative flex-grow transition-all duration-300 ease-in-out overflow-auto h-[calc(100vh-64px)] ${
            isSidebarOpen ? "pr-80" : ""
          }`}
          onClick={handleBackgroundClick}
        >
          <ResponsiveGridLayout
            className="layout" // Added bottom padding to prevent content from being cut off
            breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480 }}
            cols={{ lg: 12, md: 12, sm: 12, xs: 12 }}
            rowHeight={30}
            draggableHandle=".drag-handle"
            isDraggable={isEditing}
            isResizable={isEditing}
            onLayoutChange={handleLayoutChange}
            layouts={layouts}
            compactType="vertical"
            preventCollision={false}
            allowOverlap={false}
            useCSSTransforms={true}
            verticalCompact={true}
            resizeHandles={isEditing ? ["se"] : []}
            resizeHandle={
              <span className="absolute right-2 bottom-2 cursor-pointer">
                <Expand className="w-4 w-4" />
              </span>
            }
            margin={[10, 10]}
            containerPadding={[5, 5]}
            width={isSidebarOpen ? window.innerWidth - 320 : window.innerWidth}
            onDragStart={() => setIsDragging(true)}
            onDragStop={() => {
              setTimeout(() => {
                setIsDragging(false);
              }, 100);
            }}
          >
            {dashboard.charts.map((chartId) => (
              <div
                key={chartId}
                className={`border rounded-lg ${
                  isEditing && selectedChartId === chartId
                    ? "border-blue-400 shadow-md border-solid border-1"
                    : isEditing
                    ? "border-blue-400 shadow-sm border-dashed border-1"
                    : "border-gray-200"
                }`}
                onClick={(e) => e.stopPropagation()}
              >
                <ChartItem
                  chartId={chartId}
                  chartData={localChartData.get(chartId)}
                  isEditing={isEditing}
                  isSelected={isEditing && selectedChartId === chartId}
                  onSelect={() => setSelectedChartId(chartId)}
                />
              </div>
            ))}
          </ResponsiveGridLayout>
        </div>

        {/* Chart edit sidebar */}
        <div
          className={`h-[calc(100vh-64px)] fixed right-0 top-16 transition-transform duration-300 ease-in-out ${
            isSidebarOpen ? "translate-x-0" : "translate-x-full"
          }`}
          style={{ width: "320px" }}
        >
          {isSidebarOpen && (
            <ChartEditSidebar
              chartData={selectedChartData}
              chartId={selectedChartId}
              isOpen={isSidebarOpen}
              onClose={() => setSelectedChartId(null)}
              isChartOwner={isChartOwner}
              userId={userId}
              onChartUpdate={handleChartUpdate}
            />
          )}
        </div>
      </div>
    );
  },
  // Custom equality function remains unchanged
  (prevProps, nextProps) => {
    // Check if editing state changed
    if (prevProps.isEditing !== nextProps.isEditing) return false;

    // Check if user ID changed
    if (prevProps.userId !== nextProps.userId) return false;

    // Check if charts array changed
    const prevCharts = prevProps.dashboard?.charts || [];
    const nextCharts = nextProps.dashboard?.charts || [];
    if (prevCharts.length !== nextCharts.length) return false;

    // Check if any chart IDs changed
    const chartsChanged = prevCharts.some(
      (id, index) => id !== nextCharts[index]
    );
    if (chartsChanged) return false;

    // Check if layout changed
    if (prevProps.dashboard?.layout !== nextProps.dashboard?.layout)
      return false;

    // Check if chart data map reference changed
    if (prevProps.chartData !== nextProps.chartData) return false;

    // If we got here, props are considered equal
    return true;
  }
);

DashboardGrid.displayName = "DashboardGrid";
