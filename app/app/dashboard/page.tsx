"use client";
import React, { useState } from "react";
import GridLayout, { Responsive, WidthProvider } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
);

const ResponsiveGridLayout = WidthProvider(Responsive) as any;

const initialLayouts = {
  lg: [
    { i: "newUsers", x: 0, y: 0, w: 3, h: 2 },
    { i: "totalPaidUsers", x: 3, y: 0, w: 3, h: 2 },
    { i: "subscriptionCancellation", x: 6, y: 0, w: 3, h: 2 },
    { i: "totalRevenue", x: 0, y: 2, w: 3, h: 2 },
    { i: "averageToken", x: 3, y: 2, w: 3, h: 2 },
    { i: "mrrChart", x: 6, y: 2, w: 6, h: 4 },
  ],
};

const mrrChartData = {
  labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
  datasets: [
    {
      label: "MRR ($)",
      data: [5000, 7000, 8000, 12000, 15000, 17000],
      borderColor: "#4CAF50",
      backgroundColor: "rgba(76, 175, 80, 0.2)",
      fill: true,
    },
  ],
};

const Dashboard = () => {
  const [layouts, setLayouts] = useState(initialLayouts);

  const handleLayoutChange = (currentLayout, allLayouts) => {
    setLayouts(allLayouts);
  };

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-white">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <ResponsiveGridLayout
        className="layout"
        layouts={layouts}
        onLayoutChange={handleLayoutChange}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480 }}
        cols={{ lg: 12, md: 12, sm: 12, xs: 12 }}
        rowHeight={30}
        draggableHandle=".drag-handle"
      >
        {layouts.lg.map((item) => (
          <div
            key={item.i}
            className="bg-gray-800 p-4 rounded-lg shadow-md drag-handle border border-gray-700 
                 flex flex-col justify-center items-center overflow-hidden h-full"
          >
            <p className="text-sm font-medium text-gray-400 whitespace-nowrap text-ellipsis overflow-hidden">
              {item.i.replace(/([A-Z])/g, " $1").trim()}
            </p>
            <div className="w-full h-full flex items-center justify-center overflow-hidden">
              {item.i === "mrrChart" ? (
                <Line
                  data={mrrChartData}
                  options={{ responsive: true, maintainAspectRatio: false }}
                />
              ) : (
                <h2 className="text-2xl font-bold mt-2 truncate">Data</h2>
              )}
            </div>
          </div>
        ))}
      </ResponsiveGridLayout>
    </div>
  );
};

export default Dashboard;
