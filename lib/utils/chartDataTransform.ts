"use client";
import { PostgresResponse } from "@/lib/types/DBQueryTypes";
import { generateColors } from "./colorGenerator";

type ChartDataset = {
  label: string;
  data: any[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  [key: string]: any;
};

export interface TransformedChartData {
  labels: any[];
  datasets: ChartDataset[];
}

// Simplified and required color configuration
export interface ColorConfig {
  colorScale: (t: number) => string;
  colorStart: number;
  colorEnd: number;
  useEndAsStart?: boolean;
}

interface TransformOptions {
  labelColumn: string;
  valueColumns: string[];
  colors: ColorConfig;
}

/**
 * Transforms PostgreSQL query results into Chart.js compatible format
 * with intelligent color handling for different chart types
 */
export function transformData(
  data: PostgresResponse,
  options: TransformOptions
): TransformedChartData {
  if (!data || !data.rows || data.rows.length === 0) {
    return { labels: [], datasets: [] };
  }

  const { labelColumn, valueColumns, colors } = options;
  const rows = data.rows;

  // Extract labels
  const labels = rows.map((row) => row[labelColumn]);

  // Determine if this is a single-dataset visualization (like pie/doughnut)
  const isSingleDataset = valueColumns.length === 1;

  // Generate colors based on the chart type
  const colorCount = isSingleDataset ? labels.length : valueColumns.length;
  const generatedColors = generateColors(colorCount, colors.colorScale, {
    colorStart: colors.colorStart,
    colorEnd: colors.colorEnd,
    useEndAsStart: colors.useEndAsStart || false,
  });

  if (isSingleDataset) {
    // For single dataset charts like pie/doughnut
    const dataset = {
      label: valueColumns[0],
      data: rows.map((row) => row[valueColumns[0]]),
      backgroundColor: generatedColors,
    };

    return {
      labels,
      datasets: [dataset],
    };
  } else {
    // For multi-dataset charts like bar/line
    const datasets = valueColumns.map((column, index) => {
      const color = generatedColors[index % generatedColors.length];
      return {
        label: column,
        data: rows.map((row) => row[column]),
        backgroundColor: color,
        borderColor: color,
      };
    });

    return {
      labels,
      datasets,
    };
  }
}

/**
 * Helper function to extract unique values from a column
 */
export function getUniqueValues(data: PostgresResponse, column: string): any[] {
  if (!data || !data.rows || data.rows.length === 0) return [];

  return Array.from(
    new Set(
      data.rows.map((row) => row[column]).filter((val) => val !== undefined)
    )
  );
}
