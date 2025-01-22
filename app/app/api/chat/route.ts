import { streamText, generateText, generateObject, tool } from "ai";
import { z } from "zod";
import { createAzure } from "@ai-sdk/azure";
import { createClient } from "@/utils/supabase/server";
import { Column, Schema, Table } from "@/components/stores/table_store";
import { executeQuery } from "@/components/stores/utils/query";
import { Result, configSchema } from "@/lib/types";
import { unstable_noStore as noStore } from "next/cache";
import { countTokens } from "gpt-tokenizer";

const azure = createAzure({
  resourceName: process.env.NEXT_PUBLIC_AZURE_RESOURCE_NAME, // Azure resource name
  apiKey: process.env.NEXT_PUBLIC_AZURE_API_KEY, // Azure API key
});

// Allow streaming responses up to 120 seconds
export const maxDuration = 30;
export const dynamic = "force-dynamic";

async function updateTokenUsage(
  supabase: any,
  userId: string,
  columnName: string,
  tokenCount: number
) {
  const { error } = await supabase.rpc("increment_mini_tokens", {
    p_user_id: userId,
    p_column_name: columnName,
    p_increment_value: tokenCount,
  });
  if (error) throw new Error(`Failed to update token usage: ${error.message}`);
}

async function updateUsage(supabase: any, userId: string, columnName: string) {
  const { error } = await supabase.rpc("increment_mini_count", {
    p_user_id: userId,
    p_column_name: columnName,
  });
  if (error) throw new Error(`Failed to update AI usage: ${error.message}`);
}

function getCurrentUsageColumn(): string {
  const now = new Date();
  const month = now.toLocaleString("default", { month: "long" }).toLowerCase();
  const year = now.getFullYear();
  return `${month}_${year}`;
}

export async function POST(req: Request) {
  console.log("noStore called");
  noStore();
  console.log("Post req made:");
  const supabase = await createClient();
  const { data: user, error } = await supabase.auth.getUser();

  if (error || !user) {
    return new Response(JSON.stringify({ message: "Unauthorized" }), {
      status: 401,
    });
  }

  const { messages, databaseStructure, dbType, connectionString } =
    await req.json();

  const formattedSchemas = databaseStructure.schemas
    .map((schema: Schema) => {
      const formattedTables = schema.tables
        .map((table: Table) => {
          const formattedColumns = table.columns
            .map(
              (column: Column) =>
                `  ${column.name} ${column.dataType.toUpperCase()}`
            )
            .join(",\n");
          return `${table.name} (\n${formattedColumns}\n);`;
        })
        .join("\n\n");
      return `Schema: ${schema.name}\n\n${formattedTables}`;
    })
    .join("\n\n");

  const systemPrompt = {
    role: "system",
    content: `You are a SQL (${dbType}) and Data expert. Your job is to help the user write a SQL query to retrieve the data they need. The table schema is as follows: \n\n${formattedSchemas}\n\nFor string fields, use the ILIKE operator and convert both the search term and the field to lowercase using LOWER() function. For example: LOWER(industry) ILIKE LOWER('%search_term%'). Always enclose table and column names in double quotes.`,
  };

  const promptMessage = {
    role: "user",
    content:
      "Please provide the best SQL queries to fulfill the user's request",
  };

  // Count and log tokens
  const allMessages = [systemPrompt, promptMessage, ...messages];
  const totalTokens = allMessages.reduce(
    (sum, msg) => sum + countTokens(msg.content),
    0
  );
  console.log(`Total tokens in messages: ${totalTokens}`);

  // Start token usage and general usage update in background
  const updatePromises = [
    updateTokenUsage(
      supabase,
      user.user.id,
      getCurrentUsageColumn(),
      totalTokens
    ).catch((error) => {
      console.error("Failed to update token usage:", error);
    }),
    updateUsage(supabase, user.user.id, getCurrentUsageColumn()).catch(
      (error) => {
        console.error("Failed to update AI usage:", error);
      }
    ),
  ];

  const result = streamText({
    model: azure("gpt-4o-mini"),
    tools: {
      chart: tool({
        description: "Generate a chart.",
        parameters: z.object({}),
        execute: async ({}) => {
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

          const jsonQuery = messages[messages.length - 1].content;
          const myQuery = JSON.stringify(jsonQuery, null, 2);
          console.log(`my query:  ${myQuery}`);

          const { text } = await generateText({
            model: azure("gpt-4o-mini"),
            system: "You are an SQL expert.",
            prompt: `The database schema is as follows: ${formattedSchemas}. Based on this schema, generate an SQL query to fulfill the following request: ${myQuery}. Output only valid SQL code as plain text, without formatting, explanations, or comments. Always enclose table and column names in double quotes`,
          });

          const response = await executeQuery(text, connectionString, dbType);

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

          const { object: config } = await generateObject({
            model: azure("gpt-4o-mini"),
            system: "You are a data visualization expert.",
            prompt: `Given the following data from a SQL query result, generate the chart config that best visualises the data and answers the users query. For multiple groups use multi-lines. Match the field names in the results exactly.

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
              ${resultsSchema}`,
            schema: configSchema,
          });

          const colors: Record<string, string> = {};
          config.yKeys.forEach((key, index) => {
            colors[key] = `hsl(var(--chart-${index + 1}))`;
          });

          const updatedConfig = { ...config, colors };

          return { results, sql: text, config: updatedConfig };
        },
      }),
    },
    messages: [systemPrompt, promptMessage, ...messages],
    maxTokens: 1000,
  });

  // Ensure usage updates are completed before returning
  await Promise.all(updatePromises);

  return result.toDataStreamResponse();
}
