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
import { Button } from "@/components/ui/button";

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
  const [tempLayouts, setTempLayouts] = useState(initialLayouts);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  const handleLayoutChange = (_currentLayout: any, allLayouts: any) => {
    if (isEditing) setTempLayouts(allLayouts);
  };

  const handleEdit = () => {
    setIsEditing(true);
    setTempLayouts(layouts);
  };

  const handleSave = () => {
    setLayouts(tempLayouts);
    setIsEditing(false);
    setSelectedItem(null);
  };

  const handleCancel = () => {
    setTempLayouts(layouts);
    setIsEditing(false);
    setSelectedItem(null);
  };

  const handleClick = (itemId: string) => {
    if (isEditing) {
      setSelectedItem((prev) => (prev === itemId ? null : itemId));
    }
  };

  return (
    <div className="p-6 min-h-screen text-white">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        {!isEditing ? (
          <Button onClick={handleEdit}>Edit</Button>
        ) : (
          <div className="space-x-2">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save</Button>
          </div>
        )}
      </div>

      <ResponsiveGridLayout
        className="layout"
        layouts={tempLayouts}
        onLayoutChange={handleLayoutChange}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480 }}
        cols={{ lg: 12, md: 12, sm: 12, xs: 12 }}
        rowHeight={30}
        draggableHandle=".drag-handle"
        isDraggable={isEditing}
        isResizable={isEditing}
      >
        {layouts.lg.map((item) => (
          <div
            key={item.i}
            onClick={() => handleClick(item.i)}
            className={`bg-opacity-0 p-4 rounded-lg shadow-md drag-handle border 
                 flex flex-col justify-center items-center overflow-hidden h-full cursor-pointer border-gray-700
                 ${selectedItem === item.i ? "border-sky-500 border-2 border-double" : ""} ${isEditing ? "border-dashed border-white" : ""}`}
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
