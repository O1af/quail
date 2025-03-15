import React, { memo, useEffect, useMemo, useState } from "react";
import { Responsive, WidthProvider } from "react-grid-layout";
import { Dashboard } from "@/components/stores/dashboard_store";
import { ChartItem } from "@/app/app/(bi)/dashboards/[slug]/components/ChartItem";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { Expand } from "lucide-react";

interface DashboardGridProps {
  dashboard: Dashboard;
  chartData: Map<string, any>;
  isEditing: boolean;
  onLayoutChange: (layout: any) => void;
}

// Initialize the WidthProvider outside the component to avoid re-creation
const ResponsiveGridLayout = WidthProvider(Responsive);

export const DashboardGrid = memo(
  ({ dashboard, chartData, isEditing, onLayoutChange }: DashboardGridProps) => {
    // Add state to track the selected chart
    const [selectedChartId, setSelectedChartId] = useState<string | null>(null);

    // Use useMemo for layouts to prevent recreating the object on every render
    const layouts = useMemo(
      () => ({
        lg: dashboard?.layout || [],
      }),
      [dashboard?.layout]
    );

    // Log only when the component actually renders
    useEffect(() => {
      console.log("DashboardGrid rendered");
    });

    // Only render if dashboard is available
    if (!dashboard) {
      return <div>Loading dashboard...</div>;
    }

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
          onLayoutChange={onLayoutChange}
          layouts={layouts}
          compactType="vertical"
          preventCollision={false}
          allowOverlap={false}
          useCSSTransforms={true}
          verticalCompact={true}
          resizeHandles={isEditing ? ["se"] : []}
          resizeHandle={
            <span className="absolute right-2 bottom-2 cursor-pointer">
              <Expand className="w-4 h-4" />
            </span>
          }
          margin={[10, 10]}
          containerPadding={[5, 5]}
        >
          {dashboard.charts.map((chartId) => (
            <div
              key={chartId}
              className={`border rounded-lg ${
                isEditing && selectedChartId === chartId
                  ? "border-primary shadow-md border-solid border-blue-400 border-1"
                  : isEditing
                  ? "border-primary/50 shadow-md border-dashed border-blue-400 border-1"
                  : ""
              }`}
            >
              <ChartItem
                chartId={chartId}
                chartData={chartData.get(chartId)}
                isEditing={isEditing}
                isSelected={isEditing && selectedChartId === chartId}
                onSelect={() => setSelectedChartId(chartId)}
              />
            </div>
          ))}
        </ResponsiveGridLayout>
      </div>
    );
  },
  // Improved custom equality function with deep comparison
  (prevProps, nextProps) => {
    // Check if editing state changed
    if (prevProps.isEditing !== nextProps.isEditing) return false;

    // Check if charts array changed
    const prevCharts = prevProps.dashboard?.charts || [];
    const nextCharts = nextProps.dashboard?.charts || [];
    if (prevCharts.length !== nextCharts.length) return false;

    // Check if any chart IDs changed
    const chartsChanged = prevCharts.some(
      (id, index) => id !== nextCharts[index]
    );
    if (chartsChanged) return false;

    // Check if layout changed (simple reference check, the actual comparison is expensive)
    if (prevProps.dashboard?.layout !== nextProps.dashboard?.layout)
      return false;

    // Check if chart data map reference changed
    if (prevProps.chartData !== nextProps.chartData) return false;

    // If we got here, props are considered equal
    return true;
  }
);

DashboardGrid.displayName = "DashboardGrid";
