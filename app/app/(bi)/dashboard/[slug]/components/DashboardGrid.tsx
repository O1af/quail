import React, { memo, useRef } from "react";
import { Responsive, WidthProvider } from "react-grid-layout";
import { Dashboard } from "@/components/stores/dashboard_store";
import { ChartItem } from "@/app/app/(bi)/dashboard/[slug]/components/ChartItem";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { Expand } from "lucide-react";

interface DashboardGridProps {
  dashboard: Dashboard;
  chartData: Map<string, any>;
  isEditing: boolean;
  onLayoutChange: (layout: any) => void;
}

export const DashboardGrid = memo(
  ({ dashboard, chartData, isEditing, onLayoutChange }: DashboardGridProps) => {
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
          onLayoutChange={onLayoutChange}
          layouts={{
            lg: dashboard.layout,
          }}
          compactType="vertical"
          preventCollision={false}
          allowOverlap={false}
          useCSSTransforms={true}
          verticalCompact={true}
          resizeHandles={isEditing ? ["se"] : []}
          //add bottom right icon expand lucide
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
                isEditing ? "border-primary/50 shadow-md" : ""
              }`}
            >
              <ChartItem
                chartId={chartId}
                chartData={chartData.get(chartId)}
                isEditing={isEditing}
              />
            </div>
          ))}
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

DashboardGrid.displayName = "DashboardGrid";
