import {
  ChartConfiguration,
  ChartColumnMappingType,
} from "../types/BI/chartjsTypes";

export function hydrateChartConfig(
  mapping: ChartColumnMappingType,
  data: any[]
): ChartConfiguration {
  if (!data || data.length === 0) {
    return createEmptyChart(mapping);
  }

  const isPieOrDoughnut = ["pie", "doughnut"].includes(mapping.type);

  // Format labels consistently
  const labels = data
    .map((row) =>
      formatValue(
        row[mapping.columns.labels],
        mapping.columns.labelType || "string"
      )
    )
    .map(String);

  // Create datasets based on chart type
  const datasets = isPieOrDoughnut
    ? createPieDataset(mapping, data)
    : createStandardDatasets(mapping, data);

  return {
    type: mapping.type,
    data: { labels, datasets },
    options: createChartOptions(mapping, isPieOrDoughnut),
  };
}

// Create a placeholder chart when no data is available
function createEmptyChart(mapping: ChartColumnMappingType): ChartConfiguration {
  return {
    type: mapping.type,
    data: {
      labels: [],
      datasets: [{ label: "No data", data: [] }],
    },
    options: createChartOptions(
      mapping,
      ["pie", "doughnut"].includes(mapping.type)
    ),
  };
}

// Create dataset for pie/doughnut charts
function createPieDataset(mapping: ChartColumnMappingType, data: any[]) {
  const valueColumn = mapping.columns.values[0];
  return [
    {
      label: valueColumn.label || "Value",
      data: data.map((row) =>
        formatValue(
          row[valueColumn.column],
          valueColumn.type,
          valueColumn.format
        )
      ),
      borderWidth: 1,
    },
  ];
}

// Create datasets for standard charts (line, bar, etc.)
function createStandardDatasets(mapping: ChartColumnMappingType, data: any[]) {
  return mapping.columns.values.map((valueMap) => ({
    label: valueMap.label || valueMap.column || "Value",
    data: data.map((row) =>
      formatValue(row[valueMap.column], valueMap.type, valueMap.format)
    ),
    backgroundColor: valueMap.color,
    borderColor: valueMap.color,
    borderWidth: 1,
  }));
}

// Create unified chart options
function createChartOptions(
  mapping: ChartColumnMappingType,
  isPieOrDoughnut: boolean
) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    title: {
      display: true,
      text: mapping.title || "Chart",
    },
    scales: isPieOrDoughnut
      ? undefined
      : {
          x: mapping.axes?.x
            ? { title: { display: true, text: mapping.axes.x.title || "" } }
            : undefined,
          y: mapping.axes?.y
            ? { title: { display: true, text: mapping.axes.y.title || "" } }
            : undefined,
        },
    plugins: {
      colors: {
        enabled: true,
        forceOverride: true,
      },
      legend: {
        display: true,
        position: isPieOrDoughnut ? ("right" as const) : ("top" as const),
      },
    },
  };
}

// Format values based on their type and format specification
function formatValue(value: any, type: string, format?: string): any {
  // Handle null or undefined values
  if (value === null || value === undefined) {
    return type === "numeric" ? 0 : "";
  }

  switch (type) {
    case "numeric":
      const num = Number(value);
      if (isNaN(num)) return 0;

      // Format numeric values
      switch (format) {
        case "integer":
          return Math.round(num);
        case "percentage":
        case "currency":
        case "decimal":
        default:
          return num;
      }

    case "date":
    case "datetime":
      // Return dates as strings for consistent formatting
      return String(value);

    case "boolean":
      // Convert booleans to 1/0 for charting
      return value ? 1 : 0;

    case "categorical":
    case "string":
    default:
      // Convert all other values to strings
      return String(value || "");
  }
}
