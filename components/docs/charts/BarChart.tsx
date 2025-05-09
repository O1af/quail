"use client";

import { useEffect, useRef } from "react";

interface BarChartProps {
  data: number[];
  labels: string[];
  title?: string;
  color?: string;
  horizontal?: boolean;
}

export default function BarChart({
  data,
  labels,
  title = "Bar Chart",
  color = "rgba(54, 162, 235, 0.7)",
  horizontal = false,
}: BarChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<any>(null);

  useEffect(() => {
    const initChart = async () => {
      if (!chartRef.current) return;

      const { Chart, registerables } = await import("chart.js");
      Chart.register(...registerables);

      const ctx = chartRef.current.getContext("2d");
      if (!ctx) return;

      // Clean up previous chart instance
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      // Create the bar chart
      chartInstance.current = new Chart(ctx, {
        type: horizontal ? "bar" : "bar", // Chart.js uses 'bar' type for both, with different indexAxis
        data: {
          labels,
          datasets: [
            {
              label: title,
              data,
              backgroundColor: color,
              borderColor: color.replace("0.7", "1"),
              borderWidth: 1,
            },
          ],
        },
        options: {
          indexAxis: horizontal ? "y" : "x",
          responsive: true,
          maintainAspectRatio: true,
          plugins: {
            legend: {
              display: false,
            },
            title: {
              display: !!title,
              text: title,
              font: {
                size: 16,
              },
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: {
                color: "rgba(0, 0, 0, 0.05)",
              },
            },
            x: {
              grid: {
                display: false,
              },
            },
          },
        },
      });
    };

    initChart();

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data, labels, title, color, horizontal]);

  return (
    <div className="w-full h-full flex items-center justify-center">
      <canvas ref={chartRef} />
    </div>
  );
}
