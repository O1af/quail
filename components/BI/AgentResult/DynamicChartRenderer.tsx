"use client";
import { useMemo, useCallback, memo, useEffect } from "react";
import { useTheme } from "next-themes";
import CustomJsxParser from "./JSXParser";
import { PostgresResponse } from "@/lib/types/DBQueryTypes";
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
  LogarithmicScale,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import "chartjs-adapter-date-fns";

// Import D3 color scales directly
import * as d3 from "d3";

import {
  Line,
  Bar,
  Pie,
  Doughnut,
  Scatter,
  Radar,
  PolarArea,
} from "react-chartjs-2";

// Register ChartJS components once outside component
ChartJS.register(
  CategoryScale,
  LinearScale,
  LogarithmicScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  TimeScale,
  RadialLinearScale,
  Filler,
  Title,
  Tooltip,
  Legend
);

// Configure theme-aware Chart.js defaults
const configureChartDefaults = (isDarkMode: boolean) => {
  const gridColor = isDarkMode
    ? "rgba(255, 255, 255, 0.1)"
    : "rgba(0, 0, 0, 0.1)";
  const textColor = isDarkMode
    ? "rgba(255, 255, 255, 0.7)"
    : "rgba(0, 0, 0, 0.7)";

  // Set default scale options
  ChartJS.defaults.scales.linear.grid = {
    ...ChartJS.defaults.scales.linear.grid,
    color: gridColor,
  };

  ChartJS.defaults.scales.category.grid = {
    ...ChartJS.defaults.scales.category.grid,
    color: gridColor,
  };

  ChartJS.defaults.scales.time.grid = {
    ...ChartJS.defaults.scales.time.grid,
    color: gridColor,
  };

  // Set default text color
  ChartJS.defaults.color = textColor;

  // Set default legend text color
  ChartJS.defaults.plugins.legend.labels = {
    ...ChartJS.defaults.plugins.legend.labels,
    color: textColor,
  };

  // Set default tooltip styles
  ChartJS.defaults.plugins.tooltip = {
    ...ChartJS.defaults.plugins.tooltip,
    titleColor: isDarkMode ? "rgba(255, 255, 255, 0.9)" : "rgba(0, 0, 0, 0.9)",
    bodyColor: isDarkMode ? "rgba(255, 255, 255, 0.9)" : "rgba(0, 0, 0, 0.9)",
    backgroundColor: isDarkMode
      ? "rgba(50, 50, 50, 0.9)"
      : "rgba(255, 255, 255, 0.9)",
    borderColor: isDarkMode
      ? "rgba(100, 100, 100, 0.8)"
      : "rgba(200, 200, 200, 0.9)",
  };
};

interface DynamicChartRendererProps {
  jsxString: string;
  data: PostgresResponse;
  className?: string;
}

// Create stable chart component object
const chartComponents = {
  Line,
  Bar,
  Pie,
  Doughnut,
  Scatter,
  Radar,
  PolarArea,
};

// Create memoized error renderer
const ErrorDisplay = memo(({ message }: { message: string }) => (
  <div className="p-4 text-red-500 border border-red-300 rounded">
    Failed to render chart: {message}
  </div>
));

// Create memoized empty state component
const EmptyState = memo(() => (
  <div className="flex items-center justify-center h-full text-muted-foreground">
    Missing chart code or data
  </div>
));

function DynamicChartRenderer({
  jsxString,
  data,
  className,
}: DynamicChartRendererProps) {
  // Get the current theme
  const { resolvedTheme } = useTheme();

  // Update chart defaults when theme changes
  useEffect(() => {
    const isDarkMode = resolvedTheme === "dark";
    configureChartDefaults(isDarkMode);
  }, [resolvedTheme]);

  if (!jsxString || !data) {
    return <EmptyState />;
  }

  // Stable error handler
  const handleError = useCallback((err: Error) => {
    console.error("JSX Parser error:", err);
  }, []);

  // Memoize bindings to prevent recreation on each render
  const bindings = useMemo(
    () => ({
      data,
      d3,
      isDarkMode: resolvedTheme === "dark",
    }),
    [data, resolvedTheme]
  );

  try {
    return (
      <div className={className}>
        <CustomJsxParser
          jsx={jsxString}
          components={chartComponents}
          bindings={bindings}
          onError={handleError}
        />
      </div>
    );
  } catch (error) {
    console.error("Chart rendering error:", error);
    return <ErrorDisplay message={(error as Error).message} />;
  }
}

// Export memoized component
export default memo(DynamicChartRenderer);
