import React from "react";
import { Grip, BarChart } from "lucide-react";
import { ChartDocument } from "@/lib/types/stores/chart";
import DashboardChartRenderer from "@/components/BI/Charts/DashboardChartRenderer";

interface ChartItemProps {
  chartId: string;
  chartData: ChartDocument | null;
  isEditing: boolean;
}

export function ChartItem({ chartId, chartData, isEditing }: ChartItemProps) {
  return (
    <div className="flex flex-col h-full">
      {isEditing && (
        <div className="drag-handle bg-primary/10 text-xs p-1 text-center cursor-move">
          <Grip className="inline-block mr-1" /> Drag to move
        </div>
      )}

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
