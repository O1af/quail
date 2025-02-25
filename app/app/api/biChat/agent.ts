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
import { ChartConfig } from "@/lib/types/BI/chartjsTypes";
import {
  createSqlPrompt,
  createChartPrompt,
  createQueryValidationPrompt,
} from "./utils/prompts";
import { getModelName } from "@/utils/metrics/AI";
import { DatabaseStructure } from "@/components/stores/table_store";
import { tryCatch } from "@/lib/trycatch";
import { executeQueryWithErrorHandling } from "./utils/workflow";
import { hydrateChartConfig } from "@/lib/utils/chartHydration";
import { ChartColumnMapping } from "@/lib/types/BI/chartjsTypes";

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
      const modelName = getModelName(userTier);

      // Step 1: Generate query
      await stream.writeData({
        status: "generating_query",
        message: "Analyzing your request and generating SQL query...",
        data: { step: 1 },
      });

      console.log("DataAgentTool: Generating SQL query");
      const { data: queryData, error: queryError } = await tryCatch(
        generateText({
          model: provider(modelName),
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

      // Step 1.5: Validate query before execution
      await stream.writeData({
        status: "validating_query",
        message: "Validating query syntax and structure...",
        data: { step: 1.5, query: queryData.text },
      });

      // Execute query with error handling and potential reformulation
      const { data: resultData, query: finalQuery } =
        await executeQueryWithErrorHandling({
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

      if (!resultData?.rows?.length) {
        await stream.writeData({
          status: "error",
          message:
            "No results returned from query. Please refine your question.",
          error: true,
          data: { step: 2, query: finalQuery },
        });
        return {
          error: "No data found",
          data: [],
          visualization: null,
          query: finalQuery,
        };
      }

      console.log(
        "DataAgentTool: Query results:",
        resultData.rows.length,
        "rows"
      );
      console.log(
        "DataAgentTool: Query Types",
        JSON.stringify(resultData.types)
      );

      // Step 3: Generate visualization
      await stream.writeData({
        status: "generating_visualization",
        message: "Creating visualization configuration...",
        data: { step: 3, rowCount: resultData.rows.length },
      });

      const { data: columnMapping, error: vizError } = await tryCatch(
        generateObject({
          model: provider(modelName),
          prompt: createChartPrompt({
            data: resultData,
            query: finalQuery,
            messages,
          }),
          schema: ChartColumnMapping,
          system:
            "Select appropriate columns for data visualization based on query results and user intent.",
        })
      );

      if (vizError || !columnMapping) {
        console.error("DataAgentTool: Visualization mapping error:", vizError);
        await stream.writeData({
          status: "warning",
          message:
            "Could not generate visualization, but query executed successfully.",
          error: false,
          data: { step: 3, error: vizError?.name ?? null },
        });

        return {
          data: resultData.rows,
          visualization: null,
          query: finalQuery,
        };
      }

      const chartConfig = hydrateChartConfig(
        columnMapping.object,
        resultData.rows
      );

      console.log("DataAgentTool: Generated chart config");

      // Step 4: Return results
      const result = {
        data: resultData.rows,
        visualization: chartConfig || null,
        query: finalQuery,
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
