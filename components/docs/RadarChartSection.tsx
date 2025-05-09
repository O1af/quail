"use client";

import { TypeTable } from "fumadocs-ui/components/type-table";
import dynamic from "next/dynamic";

// Import RadarChart dynamically to avoid SSR issues
const RadarChart = dynamic(
  () => import("@/components/docs/charts/RadarChart"),
  {
    ssr: false,
    loading: () => (
      <div className="h-64 w-full bg-muted/20 animate-pulse rounded-md" />
    ),
  }
);

// Sample data for the radar chart
const radarChartData = {
  data: [65, 59, 90, 81, 56, 55],
  labels: [
    "Analysis",
    "Visualization",
    "Exploration",
    "Collaboration",
    "Documentation",
    "Modeling",
  ],
};

export function RadarChartSection() {
  return (
    <>
      <div className="mt-4">
        <div className="border rounded-lg p-4 bg-card">
          <div className="h-64 w-full">
            <RadarChart
              data={radarChartData.data}
              labels={radarChartData.labels}
              title="Team Skills Assessment"
            />
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            This radar chart displays a team's skill assessment across six key
            areas. The shape formed by connecting the data points shows
            strengths and weaknesses at a glance, making radar charts ideal for
            multidimensional comparisons.
          </p>
        </div>
      </div>
    </>
  );
}
