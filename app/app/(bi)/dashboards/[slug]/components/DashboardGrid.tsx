import React, { memo, useEffect, useMemo, useState } from "react";
import { Responsive, WidthProvider } from "react-grid-layout";
import { Dashboard } from "@/components/stores/dashboard_store";
import { ChartItem } from "@/app/app/(bi)/dashboards/[slug]/components/ChartItem";
import { ChartEditSidebar } from "@/app/app/(bi)/dashboards/[slug]/components/ChartEditSidebar";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { Expand, Lock } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface DashboardGridProps {
  dashboard: Dashboard;
  chartData: Map<string, any>;
  isEditing: boolean;
  onLayoutChange: (layout: any) => void;
  userId: string; // Add user ID to check ownership
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
  }: DashboardGridProps) => {
    // Add state to track the selected chart
    const [selectedChartId, setSelectedChartId] = useState<string | null>(null);

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
      const someChartData = chartData.get(selectedChartId);
      console.log(someChartData);
      const chartOwnerId = someChartData?.userId;

      // Log chart ownership info for debugging
      console.log("Chart Owner ID:", chartOwnerId, "Current User ID:", userId);

      return chartOwnerId === userId;
    }, [selectedChartId, chartData, userId]);

    // Handle background click to deselect chart
    const handleBackgroundClick = () => {
      if (isEditing && selectedChartId) {
        setSelectedChartId(null);
      }
    };

    // Log only when the component actually renders
    useEffect(() => {
      console.log("DashboardGrid rendered");
    });

    // Only render if dashboard is available
    if (!dashboard) {
      return <div>Loading dashboard...</div>;
    }

    // Get the selected chart data
    const selectedChartData = selectedChartId
      ? chartData.get(selectedChartId)
      : null;

    // Determine if sidebar is open - now requires ownership for edit mode
    const canEdit = isEditing && isChartOwner;
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
      <div className="flex flex-row h-full">
        {/* Main dashboard area with transition */}
        <div
          className={`relative flex-grow transition-all duration-300 ease-in-out ${
            isSidebarOpen ? "pr-80" : ""
          }`}
          onClick={handleBackgroundClick}
        >
          <ResponsiveGridLayout
            className="layout"
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
              // Reset dragging state after a brief delay to ensure
              // it doesn't trigger chart selection
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
                onClick={(e) => e.stopPropagation()} // Prevent clicks inside charts from bubbling to background
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

        {/* Chart edit sidebar - positioned to the side */}
        <div
          className={`h-[calc(100vh-64px)] fixed right-0 top-16 transition-transform duration-300 ease-in-out ${
            isSidebarOpen ? "translate-x-0" : "translate-x-full"
          }`}
          style={{ width: "320px" }}
        >
          {isSidebarOpen && (
            <>
              {
                // isChartOwner ? (
                <ChartEditSidebar
                  chartData={selectedChartData}
                  isOpen={isSidebarOpen}
                  onClose={() => setSelectedChartId(null)}
                  isChartOwner={isChartOwner}
                />
                // )
                // : (
                //   <div className="p-4 bg-white border-l border-gray-200 h-full overflow-auto">
                //     <Alert variant="destructive">
                //       <Lock className="h-4 w-4 mr-2" />
                //       <AlertDescription>
                //         You don't have permission to edit this chart. Only the
                //         chart owner can modify its properties.
                //       </AlertDescription>
                //     </Alert>

                //     <div className="mt-4">
                //       <h3 className="font-medium text-lg">Chart Details</h3>
                //       <div className="mt-2 text-sm text-gray-600">
                //         <p>ID: {selectedChartId}</p>
                //         <p>Owner: {selectedChartData?.ownerName || "Unknown"}</p>
                //         <p>
                //           Created:{" "}
                //           {selectedChartData?.createdAt
                //             ? new Date(
                //                 selectedChartData.createdAt
                //               ).toLocaleDateString()
                //             : "Unknown"}
                //         </p>
                //       </div>
                //     </div>

                //     <button
                //       className="mt-6 w-full py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-sm font-medium"
                //       onClick={() => setSelectedChartId(null)}
                //     >
                //       Close
                //     </button>
                //   </div>
                // )
              }
            </>
          )}
        </div>
      </div>
    );
  },
  // Improved custom equality function with deep comparison
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
