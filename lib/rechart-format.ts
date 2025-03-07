import { Config } from "./types/rechartTypes";

type InputDataPoint = Record<string, string | number>;

interface TransformedDataPoint {
  [key: string]: string | number | null;
}

interface TransformationResult {
  data: TransformedDataPoint[];
  xAxisField: string;
  lineFields: string[];
}

export function transformDataForMultiLineChart(
  data: InputDataPoint[],
  chartConfig: Config
): TransformationResult {
  // // console.log("Input data:", data);
  const { xKey, lineCategories, measurementColumn } = chartConfig;

  const fields = Object.keys(data[0]);
  // // console.log("Fields:", fields);

  const xAxisField = xKey ?? "year"; // Assuming 'year' is always the x-axis
  const lineField =
    fields.find((field) =>
      lineCategories?.includes(data[0][field] as string)
    ) || "";

  // // console.log("X-axis field:", xAxisField);
  // // console.log("Line field:", lineField);

  const xAxisValues = Array.from(
    new Set(data.map((item) => String(item[xAxisField])))
  );

  // // console.log("X-axis values:", xAxisValues);
  // // console.log("Line categories:", lineCategories);

  const transformedData: TransformedDataPoint[] = xAxisValues.map((xValue) => {
    const dataPoint: TransformedDataPoint = { [xAxisField]: xValue };
    const matchingItem = data.find(
      (item) => String(item[xAxisField]) === xValue
    );

    lineCategories?.forEach((category) => {
      dataPoint[category] = matchingItem ? matchingItem[category] : null;
    });

    return dataPoint;
  });

  // // console.log("Transformed data:", transformedData);

  return {
    data: transformedData,
    xAxisField,
    lineFields: lineCategories ?? [],
  };
}
