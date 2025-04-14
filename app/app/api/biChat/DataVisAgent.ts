import { generateText, tool, Message, Provider, DataStreamWriter } from "ai";
import { z } from "zod";
import { createQueryValidationPrompt } from "./prompts/createSqlPrompt";
import { createChartPrompt } from "./prompts/createChartPrompt";
import { DatabaseStructure } from "@/components/stores/table_store";
import { tryCatch } from "@/lib/trycatch";
import { executeQueryWithErrorHandling, updateStatus } from "./utils/workflow";
import { ObjectId } from "mongodb";

interface DataVisAgentParams {
  supabase: any;
  messages: Message[];
  dbType: string;
  connectionString: string;
  dbSchema: DatabaseStructure;
  provider: any;
  stream: DataStreamWriter;
}

//object that contains the parameters for the DataVisAgent in zod
export const agent_tool_params = z.object({
  user_intent: z
    .string()
    .describe(
      "A detailed description of what the user is asking for, with specific metrics, dimensions, and filters identified."
    ),
  sql_query: z
    .string()
    .describe(
      "A complete, executable SQL query you've generated that addresses the user's request. Make sure it uses only tables and columns that exist in the provided schema, with proper syntax for the database type."
    ),
});

export const DataVisAgentTool = (params: DataVisAgentParams) =>
  tool({
    description:
      "A data agent tool that executes SQL queries and creates visualizations from query results.",
    parameters: agent_tool_params,
    execute: async ({ user_intent, sql_query }) => {
      const { messages, dbType, connectionString, dbSchema, provider, stream } =
        params;
      console.log("tool params", user_intent, sql_query);

      // Execute the provided SQL query - step 1
      await updateStatus(stream, 1);

      // Execute query with error handling and potential reformulation
      const {
        data: resultData,
        query: finalQuery,
        success,
      } = await executeQueryWithErrorHandling({
        query: sql_query,
        connectionString,
        dbType,
        maxRetries: 1,
        stream,
        dbSchema,
        provider,
        createQueryValidationPrompt,
      });

      if (!success || !resultData) {
        return {
          error: "No data found or query execution failed",
          query: finalQuery,
        };
      }

      // Step 2: Analyze results
      await updateStatus(stream, 2);

      // Step 3: Create visualization
      const chartPrompt = createChartPrompt({
        data: resultData,
        query: finalQuery,
        messages,
        userIntent: user_intent,
      });

      await updateStatus(stream, 3);

      const { data: chartJsxData, error: vizError } = await tryCatch(
        generateText({
          model: provider("o3-mini"),
          prompt: chartPrompt,
          system:
            "You are a data visualization expert. Generate Chart.js JSX code based on data analysis requirements.",
        })
      );

      if (vizError || !chartJsxData) {
        return {
          error: "Visualization generation failed",
          data: resultData,
          query: finalQuery,
        };
      }

      // Generate a chart ID
      const chartId = new ObjectId().toString();

      // Create final result with all required fields
      const result = {
        data: resultData,
        query: finalQuery,
        chartJsx: chartJsxData.text,
        chartId: chartId,
      };

      return result;
    },
  });
