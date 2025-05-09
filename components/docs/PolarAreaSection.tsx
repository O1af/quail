"use client";

import { TypeTable } from "fumadocs-ui/components/type-table";
import dynamic from "next/dynamic";

// Import PolarAreaChart dynamically to avoid SSR issues
const PolarAreaChart = dynamic(
  () => import("@/components/docs/charts/PolarAreaChart"),
  {
    ssr: false,
    loading: () => (
      <div className="h-64 w-full bg-muted/20 animate-pulse rounded-md" />
    ),
  }
);

// Sample data for the polar area chart
const polarChartData = {
  data: [18, 15, 12, 9, 7, 5],
  labels: [
    "Data Analysis",
    "Visualization",
    "Trends",
    "Comparison",
    "Distribution",
    "Relationships",
  ],
};

export function PolarAreaSection() {
  return (
    <>
      <div className="mt-4">
        <div className="border rounded-lg p-4 bg-card">
          <div className="h-64 w-full">
            <PolarAreaChart
              data={polarChartData.data}
              labels={polarChartData.labels}
              title="Data Science Skills Distribution"
            />
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            This polar area chart shows the relative importance of different
            skills in data science. The area of each segment represents the
            importance of each skill, making it easy to compare multiple
            categories at once.
          </p>
        </div>
      </div>
    </>
  );
}
