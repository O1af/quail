"use client";

import { TypeTable } from "fumadocs-ui/components/type-table";
import dynamic from "next/dynamic";

// Import BarChart dynamically to avoid SSR issues
const BarChart = dynamic(() => import("@/components/docs/charts/BarChart"), {
  ssr: false,
  loading: () => (
    <div className="h-64 w-full bg-muted/20 animate-pulse rounded-md" />
  ),
});

// Sample data for the bar chart
const barChartData = {
  data: [65, 59, 80, 81, 56, 55],
  labels: ["Q1", "Q2", "Q3", "Q4", "Q1", "Q2"],
};

export function BarChartSection() {
  return (
    <>
      <div className="mt-4">
        <div className="border rounded-lg p-4 bg-card">
          <div className="h-64 w-full">
            <BarChart
              data={barChartData.data}
              labels={barChartData.labels}
              title="Quarterly Revenue (2022-2023)"
              color="rgba(75, 192, 192, 0.7)"
            />
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            This bar chart shows quarterly revenue over a 6-quarter period. Bar
            charts excel at comparing discrete categories, making it easy to
            identify the highest and lowest performing quarters at a glance.
          </p>
        </div>
      </div>
    </>
  );
}
