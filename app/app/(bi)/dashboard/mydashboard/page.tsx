"use client";
import React, { useState } from "react";
import GridLayout, { Responsive, WidthProvider } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import "chart.js/auto";
import { Line, Bar, Doughnut, Pie } from "react-chartjs-2";
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
import { PencilRuler } from "lucide-react";

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

const mrrChartData = {
  labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
  datasets: [
    {
      label: "MRR ($)",
      data: [5000, 7000, 8000, 12000, 15000, 17000],
      borderColor: "#4CAF50",
      spanGaps: true,
      fill: true,
    },
  ],
};

const userTypeData = {
  labels: ["Free", "Basic", "Pro", "Enterprise"],
  datasets: [
    {
      label: "User Types",
      data: [300, 150, 100, 50],
      spanGaps: true,
      fill: true,
    },
  ],
};

const dashboardItems = [
  {
    id: "newUsers",
    title: "New Users",
    type: "text",
    layout: { x: 0, y: 0, w: 3, h: 2 },
  },
  {
    id: "totalPaidUsers",
    title: "Total Paid Users",
    type: "text",
    layout: { x: 3, y: 0, w: 3, h: 2 },
  },
  {
    id: "subscriptionCancellation",
    title: "Subscription Cancellations",
    type: "text",
    layout: { x: 6, y: 0, w: 3, h: 2 },
  },
  {
    id: "totalRevenue",
    title: "Total Revenue",
    type: "text",
    layout: { x: 0, y: 2, w: 3, h: 2 },
  },
  {
    id: "averageToken",
    title: "Average Tokens Used",
    type: "text",
    layout: { x: 3, y: 2, w: 3, h: 2 },
  },
  {
    id: "mrrChart",
    title: "MRR Chart",
    type: "chart",
    chartType: "line",
    data: mrrChartData,
    layout: { x: 6, y: 2, w: 6, h: 4 },
  },
  {
    id: "userTypeChart",
    title: "User Types",
    type: "chart",
    chartType: "pie",
    data: userTypeData,
    layout: { x: 0, y: 4, w: 6, h: 4 },
  },
];

const initialLayouts = {
  lg: dashboardItems.map((item) => ({
    i: item.id,
    ...item.layout,
  })),
};

const Dashboard = () => {
  const [layouts, setLayouts] = useState(initialLayouts);
  const [tempLayouts, setTempLayouts] = useState(initialLayouts);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [chartTypes, setChartTypes] = useState(
    dashboardItems.reduce(
      (acc, item) => {
        if (item.type === "chart") acc[item.id] = item.chartType;
        return acc;
      },
      {} as Record<string, string>,
    ),
  );

  const handleLayoutChange = (_currentLayout: any, allLayouts: any) => {
    if (isEditing) {
      setTempLayouts(allLayouts);
      dashboardItems.forEach((item) => {
        const updatedLayout = allLayouts.lg.find(
          (layout: any) => layout.i === item.id,
        );
        if (updatedLayout) {
          item.layout = {
            x: updatedLayout.x,
            y: updatedLayout.y,
            w: updatedLayout.w,
            h: updatedLayout.h,
          };
        }
      });
    }
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

  const handleChartTypeChange = (chartId: string, newType: string) => {
    setChartTypes((prev) => ({ ...prev, [chartId]: newType }));
  };

  const generateColors = (count: number) => {
    const colors = [];

    // Define base colors in the blue-green spectrum
    const baseColors = [
      "hsl(195, 85%, 45%)", // Bright cyan
      "hsl(220, 85%, 55%)", // Royal blue
      "hsl(170, 75%, 45%)", // Sea green
      "hsl(200, 75%, 55%)", // Ocean blue
      "hsl(185, 80%, 45%)", // Turquoise
    ];

    // If we need more colors than our base set, generate additional ones
    if (count <= baseColors.length) {
      return baseColors.slice(0, count);
    }

    // Add base colors first
    colors.push(...baseColors);

    // Generate additional colors using variations
    for (let i = baseColors.length; i < count; i++) {
      const hue = 170 + ((i * 25) % 50); // Keeps hue between 170-220 (blue-green range)
      const saturation = 65 + ((i * 5) % 20); // Varies saturation between 65-85%
      const lightness = 45 + ((i * 5) % 15); // Varies lightness between 45-60%
      colors.push(`hsl(${hue}, ${saturation}%, ${lightness}%)`);
    }

    return colors;
  };

  const renderChart = (item: any) => {
    const chartType = chartTypes[item.id] || item.chartType;
    const dataset = item.data.datasets[0];

    const isPieOrDoughnut = chartType === "pie" || chartType === "doughnut";
    const colors = isPieOrDoughnut ? generateColors(dataset.data.length) : [];

    const colorMap: Record<
      string,
      { borderColor: string; backgroundColor: string | string[] }
    > = {
      line: {
        borderColor: "#4CAF50",
        backgroundColor: "rgba(76, 175, 80, 0.2)",
      },
      bar: {
        borderColor: "#357A38",
        backgroundColor: "rgba(76, 175, 80, 1)",
      },
      doughnut: {
        borderColor: "#36A2EB",
        backgroundColor: colors,
      },
      pie: {
        borderColor: "#FFCE56",
        backgroundColor: colors,
      },
    };

    // Apply colors dynamically
    const updatedData = {
      ...item.data,
      datasets: [
        {
          ...dataset,
          borderColor: colorMap[chartType]?.borderColor || dataset.borderColor,
          backgroundColor:
            colorMap[chartType]?.backgroundColor || dataset.backgroundColor,
        },
      ],
    };

    const chartProps = {
      data: updatedData,
      options: { responsive: true, maintainAspectRatio: false },
    };

    switch (chartType) {
      case "line":
        return <Line {...chartProps} />;
      case "bar":
        return <Bar {...chartProps} />;
      case "doughnut":
        return <Doughnut {...chartProps} />;
      case "pie":
        return <Pie {...chartProps} />;
      default:
        return <p>Unsupported chart type</p>;
    }
  };

  return (
    <div className="p-6 min-h-screen text-white">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        {!isEditing ? (
          <Button variant="secondary" onClick={handleEdit}>
            <PencilRuler /> Edit
          </Button>
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
        layouts={{ lg: layouts.lg }}
        onLayoutChange={handleLayoutChange}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480 }}
        cols={{ lg: 12, md: 12, sm: 12, xs: 12 }}
        rowHeight={30}
        draggableHandle=".drag-handle"
        isDraggable={isEditing}
        isResizable={isEditing}
      >
        {dashboardItems.map((item) => (
          <div
            key={item.id}
            onClick={() => handleClick(item.id)}
            className={`bg-opacity-0 p-4 rounded-lg shadow-md drag-handle border 
            flex flex-col justify-center items-center overflow-hidden h-full cursor-pointer border-gray-700
            ${selectedItem === item.id ? "border-sky-500 border-2 border-double" : ""} 
            ${isEditing ? "border-dashed border-white" : ""}`}
          >
            <p className="text-sm font-medium text-gray-400 whitespace-nowrap text-ellipsis overflow-hidden">
              {item.title}
            </p>
            <div className="w-full h-full flex items-center justify-center overflow-hidden">
              {item.type === "chart" ? (
                <>
                  {isEditing && (
                    <select
                      value={chartTypes[item.id] || item.chartType}
                      onChange={(e) =>
                        handleChartTypeChange(item.id, e.target.value)
                      }
                      className="text-black bg-gray-100 rounded-md p-1 mt-2"
                    >
                      <option value="line">Line</option>
                      <option value="bar">Bar</option>
                      <option value="doughnut">Doughnut</option>
                      <option value="pie">Pie</option>
                    </select>
                  )}
                  {renderChart(item)}
                </>
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
