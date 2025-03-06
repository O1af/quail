"use client";
import { useMemo, useCallback, memo } from "react";
import JsxParser from "react-jsx-parser";
import { PostgresResponse } from "@/lib/types/DBQueryTypes";
import { transformData, getUniqueValues } from "@/lib/utils/chartDataTransform";
import { generateColors } from "@/lib/utils/colorGenerator";
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
  Tooltip,
  Legend,
  Colors,
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

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  TimeScale,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Colors
);

// Set default locale for the date adapter
ChartJS.defaults.locale = "en-US";

interface DynamicChartRendererProps {
  jsxString: string;
  data: PostgresResponse;
  className?: string;
}

// Create stable component references
const chartComponents = {
  Line,
  Bar,
  Pie,
  Doughnut,
  Scatter,
  Bubble,
  Radar,
  PolarArea,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  TimeScale,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Colors,
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
      prevProps.bindings.data === nextProps.bindings.data
    );
  }
);

export function DynamicChartRenderer({
  jsxString,
  data,
  className,
}: DynamicChartRendererProps) {
  if (!jsxString || !data) {
    return <div>Missing chart code or data</div>;
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
      d3, // Provide d3 directly
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
