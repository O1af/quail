"use client";

import { useEffect, useRef } from "react";

interface PolarAreaChartProps {
  data: number[];
  labels: string[];
  title?: string;
  colors?: string[];
}

export default function PolarAreaChart({
  data,
  labels,
  title = "Polar Area Chart",
  colors = [
    "rgba(255, 99, 132, 0.7)",
    "rgba(54, 162, 235, 0.7)",
    "rgba(255, 206, 86, 0.7)",
    "rgba(75, 192, 192, 0.7)",
    "rgba(153, 102, 255, 0.7)",
    "rgba(255, 159, 64, 0.7)",
  ],
}: PolarAreaChartProps) {
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

      // Ensure we have enough colors for all data points
      const chartColors = [...colors];
      while (chartColors.length < data.length) {
        chartColors.push(...colors);
      }

      // Create the polar area chart
      chartInstance.current = new Chart(ctx, {
        type: "polarArea",
        data: {
          labels,
          datasets: [
            {
              data,
              backgroundColor: chartColors.slice(0, data.length),
              borderWidth: 1,
              borderColor: chartColors.map((color) =>
                color.replace("0.7", "1")
              ),
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          plugins: {
            legend: {
              position: "right",
              labels: {
                boxWidth: 12,
                padding: 15,
              },
            },
            title: {
              display: !!title,
              text: title,
              font: {
                size: 16,
              },
            },
            tooltip: {
              callbacks: {
                label: (context) => {
                  const label = context.label || "";
                  const value = context.raw as number;
                  return `${label}: ${value}`;
                },
              },
            },
          },
          scales: {
            r: {
              ticks: {
                display: false,
              },
              grid: {
                color: "rgba(0, 0, 0, 0.1)",
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
  }, [data, labels, title, colors]);

  return (
    <div className="w-full h-full flex items-center justify-center">
      <canvas ref={chartRef} />
    </div>
  );
}
