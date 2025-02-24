"use client";
import { ChartConfiguration } from "@/lib/types/BI/chart";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import {
  Line,
  Bar,
  Pie,
  Doughnut,
  Scatter,
  Bubble,
  Radar,
} from "react-chartjs-2";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend
);

// Map chart types to their components
const chartComponents = {
  line: Line,
  bar: Bar,
  pie: Pie,
  doughnut: Doughnut,
  scatter: Scatter,
  bubble: Bubble,
  radar: Radar,
} as const;

interface DynamicChartProps {
  config: ChartConfiguration;
  className?: string;
}

export function DynamicChart({ config, className }: DynamicChartProps) {
  const ChartComponent = chartComponents[config.type];

  if (!ChartComponent) {
    return <div>Unsupported chart type: {config.type}</div>;
  }

  return (
    <div className={className}>
      <ChartComponent data={config.data} options={config.options} />
    </div>
  );
}
