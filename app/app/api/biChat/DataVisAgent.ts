import { generateText, tool, Message, Provider, DataStreamWriter } from "ai";
import { z } from "zod";
import {
  createSqlPrompt,
  createChartPrompt,
  createQueryValidationPrompt,
} from "./utils/prompts";
import { getModelName } from "@/utils/metrics/AI";
import { DatabaseStructure } from "@/components/stores/table_store";
import { tryCatch } from "@/lib/trycatch";
import { executeQueryWithErrorHandling, updateStatus } from "./utils/workflow";
import { PostgresResponse } from "@/lib/types/DBQueryTypes";

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
      console.log("SQL Prompt:", sqlPrompt);

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
          error: "Query generation failed",
          data: null,
          chartJsx: null,
          query: null,
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
          data: [],
          chartJsx: null,
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

      const result: {
        data: PostgresResponse;
        query: string;
        chartJsx: string | null;
      } = {
        data: resultData,
        query: finalQuery,
        chartJsx: null,
      };

      if (vizError || !chartJsxData) {
        console.error(
          "DataVisAgentTool: Visualization JSX generation error:",
          vizError
        );
        await updateStatus(
          stream,
          "Could not generate visualization, but query executed successfully.",
          {
            error: vizError?.message || "Unknown error",
          }
        );

        return result;
      }

      // Set the generated JSX
      result.chartJsx = chartJsxData.text;

      // Return final results
      await updateStatus(
        stream,
        "Here's your data visualization based on the query results.",
        result
      );

      return result;
    },
  });
