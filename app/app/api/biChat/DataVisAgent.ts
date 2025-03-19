import { generateText, tool, Message, Provider, DataStreamWriter } from "ai";
import { z } from "zod";
import {
  createSqlPrompt,
  createQueryValidationPrompt,
} from "./prompts/createSqlPrompt";
import { createChartPrompt } from "./prompts/createChartPrompt";
import { getModelName } from "@/utils/metrics/AI";
import { DatabaseStructure } from "@/components/stores/table_store";
import { tryCatch } from "@/lib/trycatch";
import { executeQueryWithErrorHandling, updateStatus } from "./utils/workflow";
import { ObjectId } from "mongodb";

interface DataVisAgentParams {
  userTier: string;
  supabase: any;
  messages: Message[];
  dbType: string;
  connectionString: string;
  dbSchema: DatabaseStructure;
  provider: any;
  stream: DataStreamWriter;
}

export const DataVisAgentTool = (params: DataVisAgentParams) =>
  tool({
    description: "A data agent tool that can query and visualize data.",
    parameters: z.object({}),
    execute: async () => {
      const {
        userTier,
        messages,
        dbType,
        connectionString,
        dbSchema,
        provider,
        stream,
      } = params;

      const modelName = getModelName(userTier);

      // Step 1: Generate SQL query using the full conversation context
      const sqlPrompt = createSqlPrompt({
        messages,
        dbType,
        databaseStructure: dbSchema,
      });

      await updateStatus(stream, "Crafting SQL query...", {
        step: 1,
        prompt: sqlPrompt,
      });

      const { data: queryData, error: queryError } = await tryCatch(
        generateText({
          model: provider(modelName),
          prompt: sqlPrompt,
          system:
            "You are a data analysis expert. Your task is to generate SQL queries that produce visualization-friendly data.",
        })
      );

      if (queryError) {
        await updateStatus(stream, "Failed to generate SQL query", {
          error: queryError?.message || "Unknown error",
        });

        return {
          error: "Failed to generate SQL query",
        };
      }

      // Execute query with error handling and potential reformulation
      const {
        data: resultData,
        query: finalQuery,
        success,
      } = await executeQueryWithErrorHandling({
        query: queryData.text,
        connectionString,
        dbType,
        maxRetries: 1,
        stream,
        dbSchema,
        provider,
        modelName,
        createQueryValidationPrompt,
      });

      if (!success || !resultData) {
        await updateStatus(
          stream,
          "No results returned from query. Please refine your question.",
          {
            originalQueryLength: queryData.text.length,
            finalQueryLength: finalQuery?.length,
          }
        );

        return {
          error: "No data found",
          query: finalQuery,
        };
      }

      // Step 3: Generate visualization JSX
      const chartPrompt = createChartPrompt({
        data: resultData,
        query: finalQuery,
        messages,
      });

      await updateStatus(stream, "Creating visualization...", {
        rowCount: resultData.rows.length,
      });

      const { data: chartJsxData, error: vizError } = await tryCatch(
        generateText({
          model: provider(modelName),
          prompt: chartPrompt,
          system:
            "You are a data visualization expert. Generate Chart.js JSX code based on data analysis requirements.",
        })
      );

      if (vizError || !chartJsxData) {
        await updateStatus(
          stream,
          "Could not generate visualization, but query executed successfully.",
          {
            error: vizError?.message || "Unknown error",
          }
        );

        return {
          error: "Visualization failed",
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

      // Return final results
      await updateStatus(
        stream,
        "Here's your data visualization based on the query results.",
        result
      );

      return result;
    },
  });
