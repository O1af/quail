"use client";
import JsxParser from "react-jsx-parser";
import { PostgresResponse } from "@/lib/types/DBQueryTypes";
import { transformData, getUniqueValues } from "@/lib/utils/chartDataTransform";
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
// Add these imports
import "chartjs-adapter-date-fns";
import { enUS } from "date-fns/locale";

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

// Rest of your component remains the same...
interface DynamicChartRendererProps {
  jsxString: string;
  data: PostgresResponse;
  className?: string;
}

export function DynamicChartRenderer({
  jsxString,
  data,
  className,
}: DynamicChartRendererProps) {
  if (!jsxString || !data) {
    return <div>Missing chart code or data</div>;
  }

  // Separate components from bindings as per JsxParser documentation
  const components = {
    // Chart components
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

  // Data utilities and helpers belong in bindings
  const bindings = {
    // Data utilities
    data,
    transformData,
    getUniqueValues,
    // Helper functions that might be useful in charts
    Math,
  };

  console.log("JSX String:", jsxString);

  const renderError = (error: Error) => (
    <div className="p-4 text-red-500 border border-red-300 rounded">
      Failed to render chart: {error.message}
    </div>
  );

  try {
    return (
      <div className={className}>
        <JsxParser
          components={components}
          bindings={bindings}
          jsx={jsxString}
          renderInWrapper={false}
          onError={(err) => console.error("JSX Parser error:", err)}
          renderError={renderError}
          showWarnings={true}
        />
      </div>
    );
  } catch (error) {
    console.error("Chart rendering error:", error);
    return renderError(error as Error);
  }
}
