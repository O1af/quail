import React, { useRef } from "react";
import { BarChart } from "lucide-react";
import { ChartDocument } from "@/lib/types/stores/chart";
import DashboardChartRenderer from "./DashboardChartRenderer";

interface ChartItemProps {
  chartId: string;
  chartData: ChartDocument | null;
  isEditing: boolean;
  isSelected?: boolean;
  onSelect?: () => void;
}

export function ChartItem({
  chartId,
  chartData,
  isEditing,
  isSelected = false,
  onSelect,
}: ChartItemProps) {
  // Use refs to track click/drag behavior
  const isDragging = useRef(false);
  const mouseDownPos = useRef({ x: 0, y: 0 });

  // Track mouse down to detect if this becomes a drag
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isEditing) return;

    mouseDownPos.current = { x: e.clientX, y: e.clientY };

    // We'll determine if this is a drag based on mouse movement
    isDragging.current = false;
  };

  // Handle mouse move to detect drag action
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isEditing) return;

    // If mouse has moved more than 5px in any direction, consider it a drag
    const dx = Math.abs(e.clientX - mouseDownPos.current.x);
    const dy = Math.abs(e.clientY - mouseDownPos.current.y);

    if (dx > 5 || dy > 5) {
      isDragging.current = true;
    }
  };

  // Only trigger onSelect if we didn't drag
  const handleClick = (e: React.MouseEvent) => {
    if (isEditing && onSelect && !isDragging.current) {
      e.stopPropagation();
      onSelect();
    }
  };

  return (
    <div
      className="flex flex-col h-full"
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
    >
      {/* Give the chart container full height minus the drag handle height if present */}
      <div
        className={`flex-1 ${
          isEditing ? "h-[calc(100%-24px)]" : "h-full"
        } overflow-hidden`}
      >
        {chartData?.data ? (
          // Pass the description to DashboardChartRenderer
          <DashboardChartRenderer
            jsxCode={chartData?.data?.chartJsx || ""}
            data={chartData?.data?.data || null}
            title={chartData.title || "Untitled Chart"}
            description={chartData.description}
            className="w-full h-full"
            isEditing={isEditing}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="bg-muted/30 p-4 sm:p-6 rounded-lg w-full flex flex-col items-center">
              <BarChart className="h-10 w-10 text-muted-foreground mb-2" />
              <h3 className="text-sm font-medium text-foreground">
                {chartData?.title || "Untitled Chart"}
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                No visualization data available
              </p>
              {chartData?.description && (
                <p className="text-xs text-muted-foreground mt-3 max-w-xs">
                  {chartData.description}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
