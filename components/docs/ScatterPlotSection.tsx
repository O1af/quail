"use client";

import { TypeTable } from "fumadocs-ui/components/type-table";
import dynamic from "next/dynamic";

// Import ScatterChart dynamically to avoid SSR issues
const ScatterChart = dynamic(() => import("@/components/charts/ScatterChart"), {
  ssr: false,
  loading: () => (
    <div className="h-64 w-full bg-muted/20 animate-pulse rounded-md" />
  ),
});

// Sample data for the scatter chart
const scatterChartData = [
  { x: 5.2, y: 82 },
  { x: 6.3, y: 91 },
  { x: 8.4, y: 97 },
  { x: 3.5, y: 58 },
  { x: 4.1, y: 67 },
  { x: 5.5, y: 77 },
  { x: 7.2, y: 85 },
  { x: 9.0, y: 94 },
  { x: 6.5, y: 85 },
  { x: 3.8, y: 65 },
  { x: 7.8, y: 89 },
  { x: 5.7, y: 79 },
  { x: 4.9, y: 72 },
  { x: 8.6, y: 96 },
  { x: 6.0, y: 84 },
];

export function ScatterPlotSection() {
  return (
    <>
      <div className="mt-4">
        <div className="border rounded-lg p-4 bg-card">
          <div className="h-64 w-full">
            <ScatterChart
              data={scatterChartData}
              xLabel="Study Hours per Week"
              yLabel="Test Score"
              title="Study Time vs. Test Performance"
              showTrendline={true}
            />
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            This scatter plot shows the relationship between weekly study hours
            and test scores. Each point represents a student, and the trend line
            reveals a positive correlation between study time and performance.
            Scatter plots excel at revealing relationships, correlations, and
            outliers between two numeric variables.
          </p>
        </div>
      </div>
    </>
  );
}
