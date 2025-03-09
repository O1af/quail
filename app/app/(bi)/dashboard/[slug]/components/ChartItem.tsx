import React from "react";
import { Grip, BarChart } from "lucide-react";
import { ChartDocument } from "@/lib/types/stores/chart";
import ChartPreviewPane from "@/components/BI/Charts/Editor/ChartPreviewPane";

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
          // Make chart preview pane take full width and height
          <div className="h-full w-full">
            <ChartPreviewPane
              jsxCode={chartData?.data?.chartJsx || ""}
              data={chartData?.data?.data || null}
              className="w-full h-full" // Add className prop
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="bg-muted/50 p-8 rounded-lg w-full flex flex-col items-center">
              <BarChart className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground">
                {chartData?.title || "Untitled Chart"}
              </h3>
              <p className="text-sm text-muted-foreground mt-2">
                No visualization data available for this chart
              </p>
              <div className="mt-6 text-xs text-muted-foreground bg-background/50 p-3 rounded-md w-full max-w-sm">
                <p className="font-medium mb-1">Chart ID: {chartId}</p>
                <p className="mb-1">
                  Created: {chartData?.createdAt?.toLocaleString()}
                </p>
                <p className="mb-1">
                  Updated: {chartData?.updatedAt?.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
