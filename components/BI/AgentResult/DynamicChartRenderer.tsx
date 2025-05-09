"use client";
import { useMemo, useCallback, memo, useEffect, useState } from "react";
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
  showSkeleton?: boolean;
  disableAnimations?: boolean;
  optimizeForDashboard?: boolean;
  onError?: (error: string) => void;
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

// Enhanced error display with more details
const ErrorDisplay = memo(
  ({ message, jsxString }: { message: string; jsxString?: string }) => (
    <div className="p-4 text-red-500 border border-red-300 rounded overflow-auto">
      <h3 className="font-medium mb-2">Chart Rendering Error</h3>
      <p className="mb-2">{message}</p>
      {jsxString && (
        <details className="text-xs mt-4">
          <summary className="cursor-pointer mb-1">Show Chart Code</summary>
          <pre className="p-2 bg-gray-100 dark:bg-gray-800 rounded overflow-auto max-h-[300px] text-xs">
            {jsxString}
          </pre>
        </details>
      )}
    </div>
  )
);
ErrorDisplay.displayName = "ErrorDisplay";

// Create memoized empty state component
const EmptyState = memo(() => (
  <div className="flex items-center justify-center h-full text-muted-foreground">
    Missing chart code or data
  </div>
));
EmptyState.displayName = "EmptyState";

function DynamicChartRenderer({
  jsxString,
  data,
  className,
  showSkeleton = true,
  disableAnimations = false,
  optimizeForDashboard = false,
  onError,
}: DynamicChartRendererProps) {
  const { resolvedTheme } = useTheme();
  const [error, setError] = useState<Error | null>(null);

  // Update chart defaults when theme changes
  useEffect(() => {
    const isDarkMode = resolvedTheme === "dark";
    configureChartDefaults(isDarkMode);
  }, [resolvedTheme]);

  // Enhanced error handler to capture and propagate errors
  const handleError = useCallback(
    (err: Error) => {
      console.error("Chart error:", err);
      setError(err);
      if (onError) {
        onError(err.message);
      }
    },
    [onError]
  );

  // Memoize bindings to prevent recreation on each render
  const bindings = useMemo(
    () => ({
      data,
      d3,
      isDarkMode: resolvedTheme === "dark",
    }),
    [data, resolvedTheme]
  );

  if (!jsxString || !data) {
    return <EmptyState />;
  }

  // If we have an error, display it
  if (error) {
    return <ErrorDisplay message={error.message} jsxString={jsxString} />;
  }

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
    const err = error as Error;
    if (onError) onError(err.message);
    return <ErrorDisplay message={err.message} jsxString={jsxString} />;
  }
}

// Export memoized component
export default memo(DynamicChartRenderer);
