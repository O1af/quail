"use client";
import { useState, useEffect, useRef, useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart3 } from "lucide-react";
import { ChartDocument } from "@/lib/types/stores/chart";
import { useTheme } from "next-themes";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  TimeScale,
  Title,
  Legend,
  Filler,
} from "chart.js";
import { Line, Bar, Pie, Doughnut, Radar, PolarArea } from "react-chartjs-2";
import { transformData } from "@/lib/utils/chartDataTransform";
import * as d3 from "d3-scale-chromatic";

// Register only the necessary ChartJS components for preview
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  TimeScale,
  Filler
);

type ChartPreviewProps = {
  chart: Pick<ChartDocument, "_id" | "title" | "updatedAt" | "data">;
};

// Extract chart type and data from JSX string
function extractChartInfo(jsxString: string) {
  let chartType = "Bar"; // Default chart type

  // Find the chart component type
  const chartMatch = jsxString.match(
    /<(Line|Bar|Pie|Doughnut|Scatter|Bubble|Radar|PolarArea)/
  );
  if (chartMatch && chartMatch[1]) {
    chartType = chartMatch[1];
  }

  // Extract the basic transform data configuration
  const labelColumnMatch = jsxString.match(/labelColumn:\s*['"]([^'"]+)['"]/);
  const valueColumnsMatch = jsxString.match(/valueColumns:\s*\[(.*?)\]/);
  const seriesColumnMatch = jsxString.match(/seriesColumn:\s*['"]([^'"]+)['"]/);

  return {
    type: chartType,
    config: {
      labelColumn: labelColumnMatch ? labelColumnMatch[1] : null,
      valueColumns: valueColumnsMatch
        ? valueColumnsMatch[1]
            .split(",")
            .map((s) => s.trim())
            .filter((s) => s.startsWith("'") || s.startsWith('"'))
            .map((s) => s.replace(/['"]/g, ""))
        : [],
      seriesColumn: seriesColumnMatch ? seriesColumnMatch[1] : null,
    },
  };
}

// Chart component mapping
const ChartComponents = {
  Line,
  Bar,
  Pie,
  Doughnut,
  Radar,
  PolarArea,
};

export function ChartPreview({ chart }: ChartPreviewProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();

  // Set up intersection observer to load charts only when visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: "100px" }
    );

    if (previewRef.current) {
      observer.observe(previewRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Small delay to avoid layout shifts
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => setIsLoaded(true), 200);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  // Extract chart information from JSX
  const chartInfo = useMemo(() => {
    if (!chart?.data?.chartJsx) return null;
    return extractChartInfo(chart.data.chartJsx);
  }, [chart?.data?.chartJsx]);

  // Configure minimalist chart options
  const options = useMemo(() => {
    const isDarkMode = resolvedTheme === "dark";
    const gridColor = isDarkMode
      ? "rgba(255, 255, 255, 0.05)"
      : "rgba(0, 0, 0, 0.05)";

    return {
      responsive: true,
      maintainAspectRatio: true,
      animation: { duration: 0 },
      plugins: {
        legend: { display: false },
        tooltip: { enabled: false },
        title: { display: false },
      },
      scales: {
        x: {
          display: false,
          grid: { display: false },
          border: { display: false },
        },
        y: {
          display: false,
          grid: { display: false },
          border: { display: false },
        },
      },
      elements: {
        point: { radius: 0 },
        line: { borderWidth: 1 },
        arc: { borderWidth: 0 },
      },
      layout: { padding: 0 },
    };
  }, [resolvedTheme]);

  // Prepare chart data using transform function
  const chartData = useMemo(() => {
    if (!chartInfo || !chart?.data?.data) return null;

    try {
      return transformData(chart.data.data, {
        labelColumn:
          chartInfo.config.labelColumn ||
          Object.keys(chart.data.data.rows[0])[0],
        valueColumns:
          chartInfo.config.valueColumns.length > 0
            ? chartInfo.config.valueColumns
            : [
                Object.keys(chart.data.data.rows[0]).find(
                  (key) => typeof chart.data.data.rows[0][key] === "number"
                ) || "",
              ],
        seriesColumn: chartInfo.config.seriesColumn || undefined,
        colors: {
          colorScale: d3.interpolateCool,
          colorStart: 0.2,
          colorEnd: 0.8,
        },
      });
    } catch (error) {
      console.error("Error transforming chart data:", error);
      return null;
    }
  }, [chart?.data?.data, chartInfo]);

  // Fallback when no chart data available
  if (!chartInfo || !chartData) {
    return (
      <div className="h-32 bg-muted/30 rounded-md flex items-center justify-center">
        <BarChart3 className="h-12 w-12 text-muted-foreground" />
      </div>
    );
  }

  // Component to render based on chart type
  const ChartComponent =
    ChartComponents[chartInfo.type as keyof typeof ChartComponents] ||
    ChartComponents.Bar;

  return (
    <div
      ref={previewRef}
      className="h-32 bg-muted/30 rounded-md overflow-hidden"
    >
      {isVisible ? (
        <>
          {!isLoaded && (
            <div className="h-full w-full flex items-center justify-center">
              <Skeleton className="h-full w-full absolute" />
            </div>
          )}
          <div
            className={`w-full h-full ${
              isLoaded ? "opacity-100" : "opacity-0"
            } transition-opacity duration-300`}
            style={{ padding: "4px" }}
          >
            <ChartComponent
              data={chartData}
              options={options}
              key={`preview-${chart._id}-${isLoaded}-${resolvedTheme}`}
            />
          </div>
        </>
      ) : (
        <div className="h-full w-full flex items-center justify-center">
          <Skeleton className="h-full w-full" />
        </div>
      )}
    </div>
  );
}
