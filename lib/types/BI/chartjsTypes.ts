import { z } from "zod";

const ChartType = z.enum([
  "line",
  "bar",
  "pie",
  "doughnut",
  "scatter",
  "bubble",
  "radar",
]);

const DataPoint = z.number().or(z.null());

const Dataset = z.object({
  label: z.string(),
  data: z.array(DataPoint),
  backgroundColor: z.string().or(z.array(z.string())).optional(),
  borderColor: z.string().or(z.array(z.string())).optional(),
  borderWidth: z.number().optional(),
});

const Title = z.object({
  display: z.boolean().optional(),
  text: z.string(),
  position: z.enum(["top", "bottom", "left", "right"]).optional(),
});

const Legend = z.object({
  display: z.boolean().optional(),
  position: z.enum(["top", "bottom", "left", "right"]).optional(),
});

// Add Colors plugin configuration
const ColorsPlugin = z.object({
  enabled: z.boolean().optional(),
  forceOverride: z.boolean().optional(),
});

const Plugins = z
  .object({
    legend: Legend.optional(),
    colors: ColorsPlugin.optional(), // Add the colors plugin option
  })
  .optional();

const Scales = z
  .object({
    x: z
      .object({
        display: z.boolean().optional(),
        title: z
          .object({
            display: z.boolean().optional(),
            text: z.string(),
          })
          .optional(),
      })
      .optional(),
    y: z
      .object({
        display: z.boolean().optional(),
        title: z
          .object({
            display: z.boolean().optional(),
            text: z.string(),
          })
          .optional(),
      })
      .optional(),
  })
  .optional();

export const ChartConfig = z.object({
  type: ChartType,
  data: z.object({
    labels: z.array(z.string()),
    datasets: z.array(Dataset),
  }),
  options: z
    .object({
      responsive: z.boolean().optional(),
      maintainAspectRatio: z.boolean().optional(),
      title: Title.optional(),
      scales: Scales,
      plugins: Plugins,
    })
    .optional(),
});

export type ChartConfiguration = z.infer<typeof ChartConfig>;

// Enhanced column type information aligned with SQL data types
const ColumnType = z.enum([
  "numeric", // INT, FLOAT, DECIMAL, etc.
  "string", // VARCHAR, TEXT, CHAR, etc.
  "date", // DATE, TIMESTAMP
  "datetime", // TIMESTAMP WITH TIMEZONE
  "boolean", // BOOLEAN
  "categorical", // Enum-like strings or numbers representing categories
  "other", // All other data types
]);

const ValueFormat = z
  .enum([
    "default",
    "percentage", // For decimal values that represent percentages
    "currency", // For monetary values
    "integer", // For whole numbers
    "decimal", // For numbers with decimal places
    "date", // For date formatting
    "datetime", // For timestamp formatting
    "string", // For text values
  ])
  .optional();

// Enhanced column mapping with SQL-aligned type information
const ColumnMapping = z.object({
  column: z.string(), // Name of the column in SQL result
  label: z.string(), // Display label for the column
  type: ColumnType, // SQL-aligned data type
  color: z.string().optional(),
  format: ValueFormat, // How to format the value for display
});

export const ChartColumnMapping = z.object({
  type: ChartType,
  columns: z.object({
    labels: z.string(), // Column to use for labels (x-axis for most charts)
    labelType: ColumnType.default("string"), // Default to string for labels
    values: z.array(ColumnMapping), // Metrics to display (y-axis values)
  }),
  title: z.string(),
  axes: z
    .object({
      x: z
        .object({
          title: z.string().optional(),
        })
        .optional(),
      y: z
        .object({
          title: z.string().optional(),
        })
        .optional(),
    })
    .optional(),
});

export type ChartColumnMappingType = z.infer<typeof ChartColumnMapping>;
