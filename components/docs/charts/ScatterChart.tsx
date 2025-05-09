"use client";

import { useEffect, useRef } from "react";

interface ScatterChartProps {
  data: Array<{ x: number; y: number }>;
  xLabel?: string;
  yLabel?: string;
  title?: string;
  pointColor?: string;
  showTrendline?: boolean;
}

export default function ScatterChart({
  data,
  xLabel = "X Axis",
  yLabel = "Y Axis",
  title = "Scatter Chart",
  pointColor = "rgba(54, 162, 235, 0.7)",
  showTrendline = false,
}: ScatterChartProps) {
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

      // Prepare data for trendline if needed
      let trendlineData: { x: number; y: number }[] = [];

      if (showTrendline && data.length > 1) {
        // Calculate linear regression
        const n = data.length;
        const sumX = data.reduce((sum, point) => sum + point.x, 0);
        const sumY = data.reduce((sum, point) => sum + point.y, 0);
        const sumXY = data.reduce((sum, point) => sum + point.x * point.y, 0);
        const sumXX = data.reduce((sum, point) => sum + point.x * point.x, 0);

        const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;

        // Find min and max X values
        const minX = Math.min(...data.map((point) => point.x));
        const maxX = Math.max(...data.map((point) => point.x));

        // Create two points for the trendline
        trendlineData = [
          { x: minX, y: minX * slope + intercept },
          { x: maxX, y: maxX * slope + intercept },
        ];
      }

      // Create the scatter chart
      chartInstance.current = new Chart(ctx, {
        type: "scatter",
        data: {
          datasets: [
            {
              label: title,
              data: data.map((point) => ({ x: point.x, y: point.y })),
              backgroundColor: pointColor,
              borderColor: pointColor.replace("0.7", "1"),
              borderWidth: 1,
              pointRadius: 5,
              pointHoverRadius: 7,
            },
            ...(showTrendline
              ? [
                  {
                    label: "Trend Line",
                    data: trendlineData,
                    type: "line" as const,
                    backgroundColor: "transparent",
                    borderColor: "rgba(255, 99, 132, 1)",
                    borderWidth: 2,
                    pointRadius: 0,
                    fill: false,
                    tension: 0,
                  },
                ]
              : []),
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          scales: {
            x: {
              title: {
                display: true,
                text: xLabel,
              },
              grid: {
                color: "rgba(0, 0, 0, 0.05)",
              },
            },
            y: {
              title: {
                display: true,
                text: yLabel,
              },
              grid: {
                color: "rgba(0, 0, 0, 0.05)",
              },
            },
          },
          plugins: {
            tooltip: {
              callbacks: {
                label: (context) => {
                  const label = context.dataset.label || "";
                  const dataPoint = context.raw as { x: number; y: number };
                  return `${label}: (${dataPoint.x.toFixed(
                    1
                  )}, ${dataPoint.y.toFixed(1)})`;
                },
              },
            },
            legend: {
              display: true,
              position: "top",
            },
            title: {
              display: !!title,
              text: title,
              font: {
                size: 16,
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
  }, [data, xLabel, yLabel, title, pointColor, showTrendline]);

  return (
    <div className="w-full h-full flex items-center justify-center">
      <canvas ref={chartRef} />
    </div>
  );
}
