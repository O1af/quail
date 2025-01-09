import { streamText } from "ai";
import { createAzure } from "@ai-sdk/azure";
import { createClient } from "@/utils/supabase/server";
import { Column, Schema, Table } from "@/components/stores/table_store";

const azure = createAzure({
  resourceName: process.env.AZURE_RESOURCE_NAME, // Azure resource name
  apiKey: process.env.AZURE_API_KEY, // Azure API key
});

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  console.log("Post req made:");
  const supabase = await createClient();
  const { data: user, error } = await supabase.auth.getUser();

  if (error || !user) {
    return new Response(JSON.stringify({ message: "Unauthorized" }), {
      status: 401,
    });
  }

  const { messages, databaseStructure, dbType } = await req.json();
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
    content: `You are a SQL (${dbType}) and data visualization expert. Your job is to help the user write a SQL query to retrieve the data they need. The table schema is as follows: \n\n${formattedSchemas}\n\nFor string fields, use the ILIKE operator and convert both the search term and the field to lowercase using LOWER() function. For example: LOWER(industry) ILIKE LOWER('%search_term%').`,
  };

  const promptMessage = {
    role: "user",
    content:
      "Please provide the best SQL queries and any relevant explanations or data visualization insights to fulfill the user's request",
  };

  // Get the database schema from Zustand store

  const result = streamText({
    model: azure("gpt-4o-mini"),
    messages: [systemPrompt, promptMessage, ...messages],
    maxTokens: 1000,
  });

  return result.toDataStreamResponse();
}
