"use client";
import { useMemo, useCallback, memo } from "react";
import JsxParser from "react-jsx-parser";
import { PostgresResponse } from "@/lib/types/DBQueryTypes";
import { transformData, getUniqueValues } from "@/lib/utils/chartDataTransform";
import { generateColors } from "@/lib/utils/colorGenerator";
import { formatNumber, formatDate } from "@/lib/utils/chartHelpers";
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
  SubTitle,
} from "chart.js";
import "chartjs-adapter-date-fns";

// Import D3 color scales directly
import * as d3 from "d3-scale-chromatic";

import {
  Line,
  Bar,
  Pie,
  Doughnut,
  Scatter,
  Bubble,
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
  SubTitle,
  Tooltip,
  Legend
);

// Set default locale for the date adapter
ChartJS.defaults.locale = "en-US";

// Configure Chart.js tooltip callbacks outside component to avoid recreation
const configureTooltipCallbacks = (() => {
  // Helper function to format dates consistently
  const formatDateToUTC = (date: Date | string | number): string => {
    return date instanceof Date
      ? date.toISOString().split("T")[0]
      : new Date(date).toISOString().split("T")[0];
  };

  ChartJS.defaults.plugins.tooltip.callbacks = {
    ...ChartJS.defaults.plugins.tooltip.callbacks,
    title: function (context) {
      if (!context.length) return "";

      // Check if we're dealing with a time scale chart
      if (
        context[0].chart.options.line ||
        context[0].chart.options.scales?.x?.type === "time"
      ) {
        // Try to get date from the chart's labels array
        if (
          context[0].dataIndex !== undefined &&
          context[0].chart.data.labels &&
          context[0].chart.data.labels[context[0].dataIndex]
        ) {
          const label = context[0].chart.data.labels[context[0].dataIndex];

          // Handle Date objects or date strings
          if (
            label instanceof Date ||
            (typeof label === "string" && !isNaN(Date.parse(label)))
          ) {
            return formatDateToUTC(label);
          }
        }

        // Try to get date from parsed X value (for time scales)
        if (context[0].parsed && typeof context[0].parsed.x === "number") {
          return formatDateToUTC(context[0].parsed.x);
        }
      }

      // Default fallback to standard behavior
      return context[0].label || "";
    },
  };
})();

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
  Bubble,
  Radar,
  PolarArea,
};

// Create memoized error renderer
const ErrorDisplay = memo(({ message }: { message: string }) => (
  <div className="p-4 text-red-500 border border-red-300 rounded">
    Failed to render chart: {message}
  </div>
));

// Memoize the JSX Parser component for better performance
const MemoizedJsxParser = memo(
  ({ jsx, components, bindings, onError }: any) => (
    <JsxParser
      components={components}
      bindings={bindings}
      jsx={jsx}
      renderInWrapper={false}
      onError={onError}
      showWarnings={true}
    />
  ),
  (prevProps, nextProps) => {
    // Only re-render when jsx or data actually change
    return (
      prevProps.jsx === nextProps.jsx &&
      JSON.stringify(prevProps.bindings.data) ===
        JSON.stringify(nextProps.bindings.data)
    );
  }
);

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
      transformData,
      getUniqueValues,
      generateColors,
      formatNumber,
      formatDate,
      d3,
    }),
    [data]
  );

  try {
    return (
      <div className={className}>
        <MemoizedJsxParser
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
