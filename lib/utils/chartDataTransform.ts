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
  seriesColumn?: string; // New option for multi-series support
}

/**
 * Transforms PostgreSQL query results into Chart.js compatible format
 * with intelligent color handling for different chart types
 */
export function transformData(
  data: PostgresResponse,
  options: TransformOptions
): TransformedChartData {
  if (!data?.rows?.length) {
    return { labels: [], datasets: [] };
  }

  const { labelColumn, valueColumns, colors, seriesColumn } = options;
  const rows = data.rows;

  // Extract labels while preserving original order
  const uniqueLabels = getOrderedUniqueValues(data, labelColumn);

  // Generate colors based on what we're visualizing
  const colorCount = seriesColumn
    ? getUniqueValues(data, seriesColumn).length
    : valueColumns.length === 1
    ? uniqueLabels.length
    : valueColumns.length;

  const generatedColors = generateColors(colorCount, colors.colorScale, {
    colorStart: colors.colorStart,
    colorEnd: colors.colorEnd,
    useEndAsStart: colors.useEndAsStart || false,
  });

  // Handle multi-series data
  if (seriesColumn) {
    return createSeriesBasedDatasets(
      rows,
      uniqueLabels,
      valueColumns[0],
      seriesColumn,
      labelColumn,
      generatedColors
    );
  }

  // Handle single dataset visualization (like pie/doughnut)
  if (valueColumns.length === 1) {
    // Create a mapping from labels to their corresponding values
    const labelToValueMap = new Map();
    rows.forEach((row) => {
      labelToValueMap.set(row[labelColumn], row[valueColumns[0]]);
    });

    // Use the map to ensure data matches the label order
    return {
      labels: uniqueLabels,
      datasets: [
        {
          label: valueColumns[0],
          data: uniqueLabels.map((label) => labelToValueMap.get(label)),
          backgroundColor: generatedColors,
        },
      ],
    };
  }

  // Handle multi-dataset charts (like bar/line with multiple metrics)
  // Create a mapping from labels to their corresponding rows
  const labelToRowMap = new Map();
  rows.forEach((row) => {
    labelToRowMap.set(row[labelColumn], row);
  });

  return {
    labels: uniqueLabels,
    datasets: valueColumns.map((column, index) => {
      const color = generatedColors[index % generatedColors.length];
      return {
        label: column,
        data: uniqueLabels.map((label) => {
          const row = labelToRowMap.get(label);
          return row ? row[column] : null;
        }),
        backgroundColor: color,
        borderColor: color,
      };
    }),
  };
}

/**
 * Helper function to create datasets for series-based charts
 */
function createSeriesBasedDatasets(
  rows: any[],
  sortedLabels: any[],
  valueColumn: string,
  seriesColumn: string,
  labelColumn: string,
  seriesColors: string[]
): TransformedChartData {
  const seriesValues = Array.from(
    new Set(rows.map((row) => row[seriesColumn]))
  );

  const datasets = seriesValues.map((seriesValue, index) => {
    // Create a map for quick lookup
    const dataMap = new Map();
    rows
      .filter((row) => row[seriesColumn] === seriesValue)
      .forEach((row) => dataMap.set(row[labelColumn], row));

    // Generate data array in the same order as sortedLabels
    const dataArray = sortedLabels.map((label) => {
      const row = dataMap.get(label);
      return row ? row[valueColumn] : null;
    });

    return {
      label: String(seriesValue),
      data: dataArray,
      backgroundColor: seriesColors[index],
      borderColor: seriesColors[index],
    };
  });

  return { labels: sortedLabels, datasets };
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

/**
 * Helper function to extract unique values from a column while preserving original order
 */
export function getOrderedUniqueValues(
  data: PostgresResponse,
  column: string
): any[] {
  if (!data || !data.rows || data.rows.length === 0) return [];

  // Use a Set to track which values we've seen
  const seen = new Set();

  // Filter rows to keep only the first occurrence of each value
  return data.rows
    .map((row) => row[column])
    .filter((value) => {
      if (value === undefined) return false;
      if (seen.has(value)) return false;
      seen.add(value);
      return true;
    });
}
