"use client";

import { TypeTable } from "fumadocs-ui/components/type-table";
import dynamic from "next/dynamic";

// Import PieChart dynamically to avoid SSR issues
const PieChart = dynamic(() => import("@/components/docs/charts/PieChart"), {
  ssr: false,
  loading: () => (
    <div className="h-64 w-full bg-muted/20 animate-pulse rounded-md" />
  ),
});

// Sample data for the charts
const pieChartData = {
  data: [35, 25, 20, 15, 5],
  labels: [
    "Marketing",
    "Development",
    "Operations",
    "Customer Support",
    "Administration",
  ],
};

export function PieChartSection() {
  return (
    <>
      <div className="mt-4">
        <h4 className="text-lg font-medium mb-2">Example Pie & Donut Charts</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Pie Chart */}
          <div className="border rounded-lg p-4 bg-card">
            <h5 className="text-sm font-medium mb-2 text-muted-foreground">
              Pie Chart
            </h5>
            <div className="h-64 w-full">
              <PieChart
                data={pieChartData.data}
                labels={pieChartData.labels}
                title="Budget Allocation"
                isDoughnut={false}
              />
            </div>
          </div>

          {/* Donut Chart */}
          <div className="border rounded-lg p-4 bg-card">
            <h5 className="text-sm font-medium mb-2 text-muted-foreground">
              Donut Chart
            </h5>
            <div className="h-64 w-full">
              <PieChart
                data={pieChartData.data}
                labels={pieChartData.labels}
                title="Budget Allocation"
                isDoughnut={true}
              />
            </div>
          </div>
        </div>

        <p className="text-sm text-muted-foreground mt-4">
          Pie and donut charts show budget allocation across different
          departments. These charts are perfect for displaying how different
          categories contribute to a whole, allowing for quick comparison of
          proportions. Donut charts offer the same information as pie charts but
          with an empty center that can be used to display additional
          information.
        </p>
      </div>
    </>
  );
}
