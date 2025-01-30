import { generateText, generateObject, tool, Message } from "ai";
import { z } from "zod";
import { createAzure } from "@ai-sdk/azure";
import { executeQuery } from "@/components/stores/utils/query";
import { Result, configSchema } from "@/lib/types";
import { countTokens } from "gpt-tokenizer";
import {
  updateTokenUsage,
  getCurrentUsageColumn,
  getModelName,
} from "@/utils/metrics/AI";

const azure = createAzure({
  resourceName: process.env.NEXT_PUBLIC_AZURE_RESOURCE_NAME,
  apiKey: process.env.NEXT_PUBLIC_AZURE_API_KEY,
});

interface ChartToolParams {
  userTier: string;
  supabase: any;
  user: any;
  messages: Message[];
  formattedSchemas: string;
  dbType: string;
  connectionString: string;
  updatePromises: Promise<void>[];
}

export const chartTool = (params: ChartToolParams) =>
  tool({
    description: "Generate a chart.",
    parameters: z.object({}),
    execute: async () => {
      console.log("Executing chart tool");
      function generateSchemaString(data: Result[]) {
        if (!Array.isArray(data) || data.length === 0) {
          return "No data available to infer schema.";
        }

        const sampleObject = data[0];
        const schemaEntries = Object.entries(sampleObject).map(
          ([key, value]) => {
            const type = typeof value === "number" ? "INTEGER" : "VARCHAR";
            return `  "${key}" ${type}`;
          }
        );

        return `Schema: InferredTable\n\nTable: GeneratedSchema\n${schemaEntries.join(
          ",\n"
        )};`;
      }

      const jsonQuery = params.messages[params.messages.length - 1].content;
      const myQuery = JSON.stringify(jsonQuery, null, 2);

      // Create a conversation history string from all messages
      const conversationHistory = params.messages
        .map((msg: Message) => `${msg.role}: ${msg.content}`)
        .join("\n\n");

      const sqlPrompt = `The database schema is as follows: ${params.formattedSchemas}. 

Previous conversation context:
${conversationHistory}

Based on this schema and conversation context, generate an SQL query to fulfill the following request: ${myQuery}. 
Ensure that the generated SQL query strictly uses only the table and column names provided in the schema. 
Do not invent any new table or column names. 
Output only valid SQL code as plain text, **without wrapping it in triple backticks or code fences**, 
and without any formatting, explanations, or comments. 
Keep in mind the database is of type ${params.dbType}.`;

      // Collect all token update promises
      const tokenUpdatePromises: Promise<void>[] = [];

      // Count tokens for SQL generation
      const sqlPromptTokens = countTokens(sqlPrompt);
      let text;
      try {
        const result = await generateText({
          model: azure(getModelName(params.userTier)),
          system: "You are an SQL expert.",
          prompt: sqlPrompt,
        });
        text = result.text;
        const sqlResponseTokens = countTokens(text);
        // Add SQL token usage promise to collection
        tokenUpdatePromises.push(
          updateTokenUsage(
            params.supabase,
            params.user.user.id,
            getCurrentUsageColumn(),
            sqlPromptTokens + countTokens(text),
            params.userTier
          ).catch((error) => {
            console.error("Failed to update SQL token usage:", error);
          })
        );
      } catch (error) {
        console.error("Error generating SQL query:", error);
        throw new Error("Failed to generate SQL query");
      }
      console.log(`Generated SQL query: ${text}`);

      let response;
      try {
        response = await executeQuery(
          text,
          params.connectionString,
          params.dbType
        );
      } catch (error) {
        console.error("Error executing query:", error);
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        return;
      }

      const results: Result[] = response.rows.map((row) => {
        const transformedRow: Result = {};
        Object.entries(row).forEach(([key, value]) => {
          transformedRow[key] = isNaN(Number(value))
            ? (value as string)
            : parseFloat(value as string);
        });
        return transformedRow;
      });

      const resultsSchema = generateSchemaString(results);
      console.log(`Results schema: ${resultsSchema}`);

      const chartPrompt = `Given the following data from a SQL query result, generate the chart config that best visualises the data and answers the users query. For multiple groups use multi-lines. Match the field names in the results exactly.

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
                ${myQuery}

                Database Schema:
                ${resultsSchema}`;

      const chartPromptTokens = countTokens(chartPrompt);
      const { object: config } = await generateObject({
        model: azure(getModelName(params.userTier)),
        system: "You are a data visualization expert.",
        prompt: chartPrompt,
        schema: configSchema,
      });
      const chartResponseTokens = countTokens(JSON.stringify(config));

      // Add chart config token usage promise to collection
      tokenUpdatePromises.push(
        updateTokenUsage(
          params.supabase,
          params.user.user.id,
          getCurrentUsageColumn(),
          chartPromptTokens + countTokens(JSON.stringify(config)),
          params.userTier
        ).catch((error) => {
          console.error("Failed to update chart token usage:", error);
        })
      );

      // Add token update promises to the main update promises array
      params.updatePromises.push(...tokenUpdatePromises);

      console.log(`Generated chart config: ${JSON.stringify(config)}`);

      if (!config) {
        console.error("Failed to generate chart config");
        throw new Error("Failed to generate chart config");
      }

      const colors: Record<string, string> = {};
      config.yKeys.forEach((key, index) => {
        colors[key] = `hsl(var(--chart-${index + 1}))`;
      });

      const updatedConfig = { ...config, colors };

      return { results, sql: text, config: updatedConfig };
    },
  });
