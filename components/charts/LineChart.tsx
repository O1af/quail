"use client";

import { useEffect, useRef } from "react";

interface LineChartProps {
  data: number[];
  labels: string[];
  title?: string;
  color?: string;
  fill?: boolean;
  tension?: number;
}

export default function LineChart({
  data,
  labels,
  title = "Line Chart",
  color = "rgba(54, 162, 235, 0.7)",
  fill = false,
  tension = 0.3,
}: LineChartProps) {
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

      // Create the line chart
      chartInstance.current = new Chart(ctx, {
        type: "line",
        data: {
          labels,
          datasets: [
            {
              label: title,
              data,
              borderColor: color.replace("0.7", "1"),
              backgroundColor: fill ? color : "transparent",
              fill,
              tension,
              borderWidth: 2,
              pointBackgroundColor: color.replace("0.7", "1"),
              pointRadius: 3,
              pointHoverRadius: 5,
            },
          ],
        },
        options: {
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
  }, [data, labels, title, color, fill, tension]);

  return (
    <div className="w-full h-full flex items-center justify-center">
      <canvas ref={chartRef} />
    </div>
  );
}
