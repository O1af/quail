"use client";

import {
  Bar,
  BarChart,
  Line,
  LineChart,
  Area,
  AreaChart,
  Pie,
  PieChart,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Config, Result } from "@/lib/types";
import { Label } from "recharts";
import { transformDataForMultiLineChart } from "@/lib/rechart-format";

function toTitleCase(str: string): string {
  return str
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
const colors = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "hsl(var(--chart-6))",
  "hsl(var(--chart-7))",
  "hsl(var(--chart-8))",
];

export function DynamicChart({
  chartData,
  chartConfig,
}: {
  chartData: Result[];
  chartConfig: Config;
}) {
  const renderChart = () => {
    if (!chartData || !chartConfig) return <div>No chart data</div>;
    const parsedChartData = chartData.map((item) => {
      const parsedItem: { [key: string]: any } = {};
      for (const [key, value] of Object.entries(item)) {
        parsedItem[key] = isNaN(Number(value)) ? value : Number(value);
      }
      return parsedItem;
    });

    const ScrollableLegend = ({ payload }: any) => {
      return (
        <div
          style={{
            maxHeight: "325px", // Limit the height of the legend
            overflowY: "auto", // Enable scrolling for the legend
            padding: "10px", // Add padding for better appearance
            border: "1px solid #ccc", // Optional: Add a border
            borderRadius: "4px", // Optional: Add rounded corners
          }}
        >
          {payload.map((entry: any, index: number) => (
            <div
              key={`legend-item-${index}`}
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "4px",
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  width: "12px",
                  height: "12px",
                  backgroundColor: entry.color,
                  marginRight: "8px",
                }}
              ></span>
              <span>{entry.value}</span>
            </div>
          ))}
        </div>
      );
    };

    chartData = parsedChartData;

    // console.log({ chartData, chartConfig });

    switch (chartConfig.type) {
      case "bar":
        return (
          <BarChart data={chartData} margin={{ bottom: 50 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey={chartConfig.xKey}
              interval="preserveStartEnd"
              tick={({ x, y, payload }) => {
                const value = String(payload.value); // Ensure payload.value is a string
                const words = value.split(" ");
                const lines = [];
                let currentLine = "";

                words.forEach((word) => {
                  if ((currentLine + word).length > 10) {
                    lines.push(currentLine);
                    currentLine = word;
                  } else {
                    currentLine += (currentLine ? " " : "") + word;
                  }
                });

                if (currentLine) lines.push(currentLine);

                return (
                  <g transform={`translate(${x},${y + 10})`}>
                    {lines.map((line, index) => (
                      <text
                        key={index}
                        x={0}
                        y={index * 12}
                        textAnchor="middle"
                        fontSize={12}
                      >
                        {line}
                      </text>
                    ))}
                  </g>
                );
              }}
              angle={0}
              textAnchor="middle"
            >
              <Label
                value={toTitleCase(chartConfig.xKey)}
                offset={0}
                position="insideBottom"
              />
            </XAxis>
            <YAxis>
              <Label
                value={toTitleCase(chartConfig.yKeys[0])}
                angle={-90}
                position="insideLeft"
              />
            </YAxis>
            <ChartTooltip content={<ChartTooltipContent />} />
            {chartConfig.legend && <Legend />}
            {chartConfig.yKeys.map((key, index) => (
              <Bar
                key={key}
                dataKey={key}
                fill={colors[index % colors.length]}
              />
            ))}
          </BarChart>
        );
      case "line":
        const { data, xAxisField, lineFields } = transformDataForMultiLineChart(
          chartData,
          chartConfig
        );
        const useTransformedData =
          chartConfig.multipleLines &&
          chartConfig.measurementColumn &&
          chartConfig.yKeys.includes(chartConfig.measurementColumn);
        return (
          <LineChart data={useTransformedData ? data : chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey={useTransformedData ? chartConfig.xKey : chartConfig.xKey}
            >
              <Label
                value={toTitleCase(
                  useTransformedData ? xAxisField : chartConfig.xKey
                )}
                offset={0}
                position="insideBottom"
              />
            </XAxis>
            <YAxis>
              <Label
                value={toTitleCase(chartConfig.yKeys[0])}
                angle={-90}
                position="insideLeft"
              />
            </YAxis>
            <ChartTooltip content={<ChartTooltipContent />} />
            {chartConfig.legend && <Legend />}
            {useTransformedData
              ? lineFields.map((key, index) => (
                  <Line
                    key={key}
                    type="monotone"
                    dataKey={key}
                    stroke={colors[index % colors.length]}
                  />
                ))
              : chartConfig.yKeys.map((key, index) => (
                  <Line
                    key={key}
                    type="monotone"
                    dataKey={key}
                    stroke={colors[index % colors.length]}
                  />
                ))}
          </LineChart>
        );
      case "area":
        return (
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={chartConfig.xKey} />
            <YAxis />
            <ChartTooltip content={<ChartTooltipContent />} />
            {chartConfig.legend && <Legend />}
            {chartConfig.yKeys.map((key, index) => (
              <Area
                key={key}
                type="monotone"
                dataKey={key}
                fill={colors[index % colors.length]}
                stroke={colors[index % colors.length]}
              />
            ))}
          </AreaChart>
        );
      case "pie":
        return (
          <PieChart>
            <Pie
              data={chartData}
              dataKey={chartConfig.yKeys[0]}
              nameKey={chartConfig.xKey}
              cx="50%"
              cy="50%"
              outerRadius={120}
            >
              {chartData.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={colors[index % colors.length]}
                />
              ))}
            </Pie>
            <ChartTooltip content={<ChartTooltipContent />} />
            {chartConfig.legend && (
              <Legend
                content={<ScrollableLegend />}
                layout="vertical"
                align="right"
                verticalAlign="middle"
              />
            )}
          </PieChart>
        );
      default:
        return <div>Unsupported chart type: {chartConfig.type}</div>;
    }
  };

  return (
    <div className="w-full flex flex-col justify-center items-center">
      <h2 className="text-lg font-bold mb-2">{chartConfig.title}</h2>
      {chartConfig && chartData.length > 0 && (
        <ChartContainer
          config={chartConfig.yKeys.reduce((acc, key, index) => {
            acc[key] = {
              label: key,
              color: colors[index % colors.length],
            };
            return acc;
          }, {} as Record<string, { label: string; color: string }>)}
          className="h-[320px] w-full"
        >
          <div style={{ overflowX: "auto", width: "100%" }}>
            <ResponsiveContainer
              width={Math.max(chartData.length, window.innerWidth * 0.9)}
              height={375}
            >
              {renderChart()}
            </ResponsiveContainer>
          </div>
        </ChartContainer>
      )}
      <div className="w-full pt-16">
        <p className="mt-4 text-sm">{chartConfig.description}</p>
        <p className="mt-2 text-sm">{chartConfig.takeaway}</p>
      </div>
    </div>
  );
}
