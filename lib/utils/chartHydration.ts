import {
  ChartConfiguration,
  ChartColumnMappingType,
} from "../types/BI/chartjsTypes";

export function hydrateChartConfig(
  mapping: ChartColumnMappingType,
  data: any[]
): ChartConfiguration {
  const labels = data.map((row) => row[mapping.columns.labels]);

  const datasets = mapping.columns.values.map((valueMap) => ({
    label: valueMap.label,
    data: data.map((row) => row[valueMap.column]),
    backgroundColor: valueMap.color,
    borderColor: valueMap.color,
    borderWidth: 1,
  }));

  return {
    type: mapping.type,
    data: {
      labels,
      datasets,
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      title: {
        display: true,
        text: mapping.title,
      },
      scales: mapping.axes
        ? {
            x: mapping.axes.x
              ? {
                  title: {
                    display: true,
                    text: mapping.axes.x.title || "",
                  },
                }
              : undefined,
            y: mapping.axes.y
              ? {
                  title: {
                    display: true,
                    text: mapping.axes.y.title || "",
                  },
                }
              : undefined,
          }
        : undefined,
    },
  };
}
