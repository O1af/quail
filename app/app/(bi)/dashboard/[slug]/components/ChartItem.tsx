import React from "react";
import { Grip } from "lucide-react";
import { DynamicChart } from "@/components/BI/AgentResult/dynamic-chartjs";

interface ChartItemProps {
  chartId: string;
  chartData: any;
  isEditing: boolean;
}

export function ChartItem({ chartId, chartData, isEditing }: ChartItemProps) {
  return (
    <>
      {isEditing && (
        <div className="drag-handle bg-primary/10 text-xs p-1 text-center cursor-move">
          <Grip className="inline-block mr-1" /> Drag to move
        </div>
      )}
      <div className="p-4 h-[calc(100%-24px)]">
        {chartData?.visualization ? (
          <DynamicChart
            config={chartData.visualization}
            className="w-full h-full"
          />
        ) : (
          <div className="text-center py-12 bg-muted/50 rounded-lg">
            <p className="text-lg text-muted-foreground">
              {chartData?.type === "chart"
                ? "No visualization available"
                : "This is a placeholder for value type chart"}
            </p>
          </div>
        )}
      </div>
    </>
  );
}
