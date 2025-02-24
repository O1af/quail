import {
  generateText,
  generateObject,
  tool,
  Message,
  Provider,
  DataStreamWriter,
} from "ai";
import { z } from "zod";
import { executeQuery } from "@/components/stores/utils/query";
import { ChartConfig } from "@/lib/types/BI/chart";
import { createSqlPrompt, createChartPrompt } from "./utils/prompts";
import { getModelName } from "@/utils/metrics/AI";
import { DatabaseStructure } from "@/components/stores/table_store";
import { tryCatch } from "@/lib/trycatch";

interface DataAgentParams {
  userTier: string;
  supabase: any;
  messages: Message[];
  dbType: string;
  connectionString: string;
  dbSchema: DatabaseStructure;
  provider: any;
  stream: DataStreamWriter;
}

export const DataAgentTool = (params: DataAgentParams) =>
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

      console.log("DataAgentTool: Starting execution");

      // Step 1: Generate query
      await stream.writeData({
        status: "generating_query",
        message: "Analyzing your request and generating SQL query...",
        data: { step: 1 },
      });

      console.log("DataAgentTool: Generating SQL query");
      const { data: queryData, error: queryError } = await tryCatch(
        generateText({
          model: provider(getModelName(userTier)),
          prompt: createSqlPrompt({
            messages,
            dbType,
            databaseStructure: dbSchema,
          }),
          system:
            "You are a data analysis expert. Your task is to generate SQL queries that produce visualization-friendly data.",
        })
      );

      if (queryError) {
        console.error("DataAgentTool: Query generation error:", queryError);
        await stream.writeData({
          status: "error",
          message: "Failed to generate SQL query: " + queryError.message,
          error: true,
          data: {
            step: 1,
            error: queryError
              ? {
                  message: String(queryError.message),
                  name: String(queryError.name),
                }
              : null,
          },
        });
        return {
          error: "Query generation failed",
          data: null,
          visualization: null,
          query: null,
        };
      }

      console.log("DataAgentTool: Generated query:", queryData.text);

      // Step 2: Execute query
      await stream.writeData({
        status: "executing_query",
        message: "Executing query to fetch your data...",
        data: { step: 2, query: queryData.text },
      });

      const { data: queryResult, error: execError } = await tryCatch(
        executeQuery(queryData.text, connectionString, dbType)
      );

      if (execError || !queryResult?.rows?.length) {
        console.error("DataAgentTool: Query execution error:", execError);
        await stream.writeData({
          status: "error",
          message: "Failed to execute query or no results returned",
          error: true,
          data: { step: 2, error: execError?.name ?? null },
        });
        return {
          error: "Query execution failed",
          data: null,
          visualization: null,
          query: null,
        };
      }

      console.log(
        "DataAgentTool: Query results:",
        queryResult.rows.length,
        "rows"
      );

      // Step 3: Generate visualization
      await stream.writeData({
        status: "generating_visualization",
        message: "Creating visualization configuration...",
        data: { step: 3, rowCount: queryResult.rows.length },
      });

      const { data: chartConfig, error: vizError } = await tryCatch(
        generateObject({
          model: provider(getModelName(userTier)),
          prompt: createChartPrompt({
            data: queryResult.rows,
            query: queryData.text,
            messages,
          }),
          schema: ChartConfig,
          system:
            "Generate appropriate Chart.js configurations based on data structure and user intent.",
        })
      );

      if (vizError) {
        console.error(
          "DataAgentTool: Visualization generation error:",
          vizError
        );
        await stream.writeData({
          status: "error",
          message: "Failed to generate visualization: " + vizError.message,
          error: true,
          data: { step: 3, error: vizError.name ?? null },
        });
        return {
          error: "Visualization generation failed",
          data: null,
          visualization: null,
          query: null,
        };
      }

      console.log("DataAgentTool: Generated chart config:", chartConfig.object);

      // Step 4: Return results
      const result = {
        data: queryResult.rows,
        visualization: chartConfig.object,
        query: queryData.text,
      };

      console.log("DataAgentTool: Sending final result");
      await stream.writeData({
        status: "completed",
        role: "assistant",
        content: `Here's your data visualization based on the query results.`,
        ...result,
      });

      return result;
    },
  });
