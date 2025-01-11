import { configSchema, Result } from "@/lib/types";
import { generateObject, generateText } from "ai";
import { createAzure } from "@ai-sdk/azure";
import { Column, Schema, Table } from "@/components/stores/table_store";
import { executeQuery } from "@/components/stores/utils/query";

const resourceName =
  process.env.NEXT_PUBLIC_AZURE_RESOURCE_NAME || "default-resource-name";
const apiKey = process.env.NEXT_PUBLIC_AZURE_API_KEY || "";

const azure = createAzure({
  resourceName: resourceName,
  apiKey: apiKey,
});

export const generateChartConfig = async (
  databaseStructure: any,
  userQuery: string,
) => {
  try {
    function generateSchemaString(data) {
      if (!Array.isArray(data) || data.length === 0) {
        return "No data available to infer schema.";
      }

      const sampleObject = data[0];
      const schemaEntries = Object.entries(sampleObject).map(([key, value]) => {
        const type = typeof value === "number" ? "INTEGER" : "VARCHAR";
        return `  "${key}" ${type}`;
      });

      return `Schema: InferredTable\n\nTable: GeneratedSchema\n${schemaEntries.join(",\n")};`;
    }

    const formattedSchemas = databaseStructure.schemas
      .map((schema: Schema) => {
        const formattedTables = schema.tables
          .map((table: Table) => {
            const formattedColumns = table.columns
              .map(
                (column: Column) =>
                  `  ${column.name} ${column.dataType.toUpperCase()}`,
              )
              .join(",\n");
            return `${table.name} (\n${formattedColumns}\n);`;
          })
          .join("\n\n");
        return `Schema: ${schema.name}\n\n${formattedTables}`;
      })
      .join("\n\n");
    console.log(
      `The database schema is as follows: ${formattedSchemas}. Based on this schema, generate an SQL query to fulfill the following request: ${userQuery}. Output only valid SQL code as plain text, without formatting, explanations, or comments.`,
    );
    const { text } = await generateText({
      model: azure("gpt-4o-mini"),
      system: "You are an SQL expert.",
      prompt: `The database schema is as follows: ${formattedSchemas}. Based on this schema, generate an SQL query to fulfill the following request: ${userQuery}. Output only valid SQL code as plain text, without formatting, explanations, or comments. Always enclose table and column names in double quotes`,
    });

    console.log(text);

    const response = await executeQuery(text);
    console.log(response);

    const results: Result[] = response.rows.map((row) => {
      const transformedRow: Result = {};
      Object.entries(row).forEach(([key, value]) => {
        transformedRow[key] = isNaN(Number(value)) ? value : parseFloat(value);
      });
      return transformedRow;
    });
    console.log("RESULTS");
    console.log(results);

    const resultsSchema = generateSchemaString(results);

    const { object: config } = await generateObject({
      model: azure("gpt-4o-mini"),
      system: "You are a data visualization expert.",
      prompt: `Given the following data from a SQL query result, generate the chart config that best visualises the data and answers the users query.
      For multiple groups use multi-lines. Match the field names in the results exactly.

      Here is an example complete config:
      export const chartConfig = {
        type: "pie",
        xKey: "month",
        yKeys: ["sales", "profit", "expenses"],
        colors: {
          sales: "#4CAF50",    // Green for sales
          profit: "#2196F3",   // Blue for profit
          expenses: "#F44336"  // Red for expenses
        },
        legend: true
      }

      User Query:
      ${userQuery}

      Database Schema:
      ${resultsSchema}`,
      schema: configSchema,
    });

    console.log(config);

    // Override with shadcn theme colors
    const colors: Record<string, string> = {};
    config.yKeys.forEach((key, index) => {
      colors[key] = `hsl(var(--chart-${index + 1}))`;
    });

    const updatedConfig = { ...config, colors };
    return { results, config: updatedConfig };
  } catch (e) {
    console.error(e);
    throw new Error("Failed to generate chart suggestion");
  }
};
