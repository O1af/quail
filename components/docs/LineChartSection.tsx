"use client";

import { TypeTable } from "fumadocs-ui/components/type-table";
import dynamic from "next/dynamic";

// Import LineChart dynamically to avoid SSR issues
const LineChart = dynamic(() => import("@/components/docs/charts/LineChart"), {
  ssr: false,
  loading: () => (
    <div className="h-64 w-full bg-muted/20 animate-pulse rounded-md" />
  ),
});

// Sample data for the line chart
const lineChartData = {
  data: [65, 59, 80, 81, 56, 55, 40, 78, 85, 90, 87, 78],
  labels: [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ],
};

export function LineChartSection() {
  return (
    <>
      <div className="mt-4">
        <div className="border rounded-lg p-4 bg-card">
          <div className="h-64 w-full">
            <LineChart
              data={lineChartData.data}
              labels={lineChartData.labels}
              title="Monthly Website Traffic (2023)"
              color="rgba(153, 102, 255, 0.7)"
              fill={true}
            />
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            This line chart displays monthly website traffic over a year. Line
            charts are ideal for showing trends over time and highlighting
            patterns such as seasonality, growth, or decline in sequential data.
          </p>
        </div>
      </div>
    </>
  );
}
