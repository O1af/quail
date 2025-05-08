"use client";

import { useEffect, useRef } from "react";

interface RadarChartProps {
  data: number[];
  labels: string[];
  title?: string;
  colors?: string[];
}

export default function RadarChart({
  data,
  labels,
  title = "Radar Chart",
  colors = ["rgba(54, 162, 235, 0.5)"],
}: RadarChartProps) {
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

      // Create the radar chart
      chartInstance.current = new Chart(ctx, {
        type: "radar",
        data: {
          labels,
          datasets: [
            {
              label: title,
              data,
              backgroundColor: colors[0],
              borderColor: colors[0].replace("0.5", "1"),
              borderWidth: 1,
              pointBackgroundColor: colors[0].replace("0.5", "1"),
              pointRadius: 3,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          scales: {
            r: {
              angleLines: {
                color: "rgba(0, 0, 0, 0.1)",
              },
              grid: {
                color: "rgba(0, 0, 0, 0.1)",
              },
              pointLabels: {
                font: {
                  size: 12,
                },
              },
            },
          },
          plugins: {
            legend: {
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
  }, [data, labels, title, colors]);

  return (
    <div className="w-full h-full flex items-center justify-center">
      <canvas ref={chartRef} />
    </div>
  );
}
