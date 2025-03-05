"use client";
import { PostgresResponse } from "@/lib/types/DBQueryTypes";

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

/**
 * Transforms PostgreSQL query results into Chart.js compatible format
 */
export function transformData(
  data: PostgresResponse,
  options: {
    labelColumn?: string;
    valueColumns?: string[];
    colors?: string[];
  } = {}
): TransformedChartData {
  if (!data || !data.rows || data.rows.length === 0) {
    return { labels: [], datasets: [] };
  }

  const rows = data.rows;
  const columns = Object.keys(rows[0]);

  // Determine label column (default to first column)
  const labelColumn = options.labelColumn || columns[0];

  // Determine value columns (default to all non-label numeric columns)
  let valueColumns = options.valueColumns || [];
  if (valueColumns.length === 0) {
    valueColumns = columns.filter((col) => {
      if (col === labelColumn) return false;
      // Check if the column contains numeric data
      const firstValue = rows[0][col];
      return typeof firstValue === "number";
    });
  }

  // Default colors
  const defaultColors = [
    "#4361ee",
    "#3a0ca3",
    "#7209b7",
    "#f72585",
    "#4cc9f0",
    "#4895ef",
    "#560bad",
    "#f15bb5",
    "#fee440",
    "#00bbf9",
  ];

  // Extract labels from the designated column
  const labels = rows.map((row) => row[labelColumn]);

  // Create datasets for each value column
  const datasets = valueColumns.map((column, index) => {
    return {
      label: column,
      data: rows.map((row) => row[column]),
      backgroundColor:
        options.colors?.[index] || defaultColors[index % defaultColors.length],
      borderColor:
        options.colors?.[index] || defaultColors[index % defaultColors.length],
      borderWidth: 1,
    };
  });

  return { labels, datasets };
}

/**
 * Helper function to extract unique values from a column
 */
export function getUniqueValues(data: PostgresResponse, column: string): any[] {
  if (!data || !data.rows || data.rows.length === 0) return [];

  const uniqueValues = new Set<any>();
  data.rows.forEach((row) => {
    if (row[column] !== undefined) {
      uniqueValues.add(row[column]);
    }
  });

  return Array.from(uniqueValues);
}
