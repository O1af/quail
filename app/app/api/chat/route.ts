import { streamText, generateText, generateObject, tool, Message } from "ai";
import { z } from "zod";
import { createAzure } from "@ai-sdk/azure";
import { createClient } from "@/utils/supabase/server";
import { Column, Schema, Table } from "@/components/stores/table_store";
import { executeQuery } from "@/components/stores/utils/query";
import { Result, configSchema } from "@/lib/types";
import { unstable_noStore as noStore } from "next/cache";
import { countTokens } from "gpt-tokenizer";
import {
  getTier,
  updateTokenUsage,
  updateUsage,
  getCurrentUsageColumn,
  getModelName,
} from "@/utils/metrics/AI";

const azure = createAzure({
  resourceName: process.env.NEXT_PUBLIC_AZURE_RESOURCE_NAME, // Azure resource name
  apiKey: process.env.NEXT_PUBLIC_AZURE_API_KEY, // Azure API key
});

// Allow streaming responses up to 120 seconds
export const maxDuration = 30;
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  //// console.log("noStore called");
  noStore();

  const supabase = await createClient();
  const { data: user, error } = await supabase.auth.getUser();

  if (error || !user) {
    return new Response(JSON.stringify({ message: "Unauthorized" }), {
      status: 401,
    });
  }

  // Check tier and usage limits
  let userTier;
  try {
    const { tier } = await getTier(
      supabase,
      user.user.id,
      getCurrentUsageColumn()
    );
    userTier = tier;
  } catch (error) {
    return new Response(
      JSON.stringify({
        message: error instanceof Error ? error.message : "Usage limit error",
      }),
      { status: 403 }
    );
  }

  const {
    messages,
    databaseStructure,
    dbType,
    connectionString,
    editorValue,
    editorError,
  } = await req.json();

  const formattedSchemas = databaseStructure.schemas
    .map((schema: Schema) => {
      const tableSummaries = schema.tables
        .map((table: Table) => {
          const columns = table.columns
            .map((col: Column) => `${col.name} (${col.dataType})`)
            .join(", ");
          return `Table ${table.name} contains columns: { ${columns}}`;
        })
        .join("\n");
      return `In schema "${schema.name}":\n${tableSummaries}`;
    })
    .join("\n\n");

  const systemPrompt = {
    role: "system",
    content: `You are a SQL (${dbType}) and Data expert. Your job is to help the user write a SQL query to retrieve the data they need. 
    The table schema is as follows: \n\n${formattedSchemas}\n\n
    Use only the table and column names provided in the schema. Do not create or invent new table names or column names. 
    For string fields, use the ILIKE operator and convert both the search term and the field to lowercase using LOWER() function. 
    For example: LOWER(industry) ILIKE LOWER('%search_term%').The user currently has this query in their editor which may or may not be of value:${editorValue}.`,
  };

  const promptMessage = {
    role: "user",
    content: `Please provide the best SQL queries to fulfill the user's request.`,
  };
  if (editorError) {
    // If there is an error in the editor, add it to the prompt message
    systemPrompt.content += `\nThe user has just faced this Error when trying to run the query: ${editorError}`;
  }

  // Count and log tokens
  const allMessages = [systemPrompt, promptMessage, ...messages];
  const totalTokens = allMessages.reduce(
    (sum, msg) => sum + countTokens(msg.content),
    0
  );

  // Start token usage and general usage update in background
  const updatePromises = [
    updateTokenUsage(
      supabase,
      user.user.id,
      getCurrentUsageColumn(),
      totalTokens,
      userTier
    ).catch((error) => {
      console.error("Failed to update token usage:", error);
    }),
    updateUsage(
      supabase,
      user.user.id,
      getCurrentUsageColumn(),
      userTier
    ).catch((error) => {
      console.error("Failed to update AI usage:", error);
    }),
  ];

  const result = streamText({
    model: azure(getModelName(userTier)),
    tools: {
      chart: tool({
        description: "Generate a chart.",
        parameters: z.object({}),
        execute: async ({}) => {
          // console.log("Executing chart tool");
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

          // Create a conversation history string from all messages
          const conversationHistory = messages
            .map((msg: Message) => `${msg.role}: ${msg.content}`)
            .join("\n\n");

          const sqlPrompt = `The database schema is as follows: ${formattedSchemas}. 

Previous conversation context:
${conversationHistory}

Based on this schema and conversation context, generate an SQL query to fulfill the following request: ${myQuery}. 
Ensure that the generated SQL query strictly uses only the table and column names provided in the schema. 
Do not invent any new table or column names. 
Output only valid SQL code as plain text, **without wrapping it in triple backticks or code fences**, 
and without any formatting, explanations, or comments. 
Keep in mind the database is of type ${dbType}.`;

          // Collect all token update promises
          const tokenUpdatePromises: Promise<void>[] = [];

          // Count tokens for SQL generation
          const sqlPromptTokens = countTokens(sqlPrompt);
          // console.log(`SQL Prompt tokens: ${sqlPromptTokens}`);
          let text;
          try {
            const result = await generateText({
              model: azure(getModelName(userTier)),
              system: "You are an SQL expert.",
              prompt: sqlPrompt,
            });
            text = result.text;
            const sqlResponseTokens = countTokens(text);
            // console.log(`SQL Response tokens: ${sqlResponseTokens}`);
            // console.log(
            //   `Total SQL tokens: ${sqlPromptTokens + sqlResponseTokens}`
            // );
            // Add SQL token usage promise to collection
            tokenUpdatePromises.push(
              updateTokenUsage(
                supabase,
                user.user.id,
                getCurrentUsageColumn(),
                sqlPromptTokens + countTokens(text),
                userTier
              ).catch((error) => {
                console.error("Failed to update SQL token usage:", error);
              })
            );
          } catch (error) {
            console.error("Error generating SQL query:", error);
            throw new Error("Failed to generate SQL query");
          }
          // console.log(`Generated SQL query: ${text}`);

          let response;
          try {
            response = await executeQuery(text, connectionString, dbType);
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
          // console.log(`Results schema: ${resultsSchema}`);

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

          // Count tokens for chart config generation
          const chartPromptTokens = countTokens(chartPrompt);
          // console.log(`Chart Prompt tokens: ${chartPromptTokens}`);
          const { object: config } = await generateObject({
            model: azure(getModelName(userTier)),
            system: "You are a data visualization expert.",
            prompt: chartPrompt,
            schema: configSchema,
          });
          const chartResponseTokens = countTokens(JSON.stringify(config));
          // console.log(`Chart Response tokens: ${chartResponseTokens}`);
          // console.log(
          //   `Total Chart tokens: ${chartPromptTokens + chartResponseTokens}`
          // );
          // console.log(
          //   `Total Tool tokens: ${
          //     sqlPromptTokens +
          //     countTokens(text) +
          //     chartPromptTokens +
          //     chartResponseTokens
          //   }`
          // );

          // Add chart config token usage promise to collection
          tokenUpdatePromises.push(
            updateTokenUsage(
              supabase,
              user.user.id,
              getCurrentUsageColumn(),
              chartPromptTokens + countTokens(JSON.stringify(config)),
              userTier
            ).catch((error) => {
              console.error("Failed to update chart token usage:", error);
            })
          );

          // Add token update promises to the main update promises array
          updatePromises.push(...tokenUpdatePromises);

          // console.log(`Generated chart config: ${JSON.stringify(config)}`);

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
      }),
    },
    messages: [systemPrompt, promptMessage, ...messages],
    maxTokens: 1000,
  });

  // Ensure usage updates are completed before returning
  await Promise.all(updatePromises);

  return result.toDataStreamResponse();
}
