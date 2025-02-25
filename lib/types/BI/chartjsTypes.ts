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
    })
    .optional(),
});

export type ChartConfiguration = z.infer<typeof ChartConfig>;

export const ChartColumnMapping = z.object({
  type: ChartType,
  columns: z.object({
    labels: z.string(),
    values: z.array(
      z.object({
        column: z.string(),
        label: z.string(),
        color: z.string().optional(),
      })
    ),
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
