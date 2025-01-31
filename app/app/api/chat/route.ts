import { streamText, Message } from "ai";
import { createAzure } from "@ai-sdk/azure";
import { createClient } from "@/utils/supabase/server";
import { Column, Schema, Table, Index } from "@/components/stores/table_store";
import { unstable_noStore as noStore } from "next/cache";
import { countTokens } from "gpt-tokenizer";
import {
  getTier,
  updateTokenUsage,
  updateUsage,
  getCurrentUsageColumn,
  getModelName,
} from "@/utils/metrics/AI";
import { chartTool } from "./chartTool";
import { DatabaseStructure } from "@/components/stores/table_store";

const azure = createAzure({
  resourceName: process.env.NEXT_PUBLIC_AZURE_RESOURCE_NAME, // Azure resource name
  apiKey: process.env.NEXT_PUBLIC_AZURE_API_KEY, // Azure API key
});

// Allow streaming responses up to 120 seconds
export const maxDuration = 30;
export const dynamic = "force-dynamic";

function formatDatabaseSchema(databaseStructure: DatabaseStructure): string {
  const schemaContext = `
Key Terms:
- PK: Primary Key, unique identifier for each row
- FK: Foreign Key, references another table's primary key
- UQ: Unique constraint, ensures values are unique
- IDX: Index, improves query performance
- NOT NULL: Column must have a value
- DEFAULT: Default value if none provided
- Schema: Logical grouping of database objects
- Table: Structure that holds data in rows and columns
- Column: Individual field in a table
- Index: Data structure for faster data retrieval\n\n`;

  const formattedSchema =
    schemaContext +
    databaseStructure.schemas
      .map((schema: Schema) => {
        const tableSummaries = schema.tables
          .map((table: Table) => {
            const columns = table.columns
              .map((col: Column) => {
                const constraints = [
                  col.isPrimary ? "PK" : "",
                  col.isUnique ? "UQ" : "",
                  col.isNullable === "NO" ? "NOT NULL" : "",
                  col.isForeignKey
                    ? `FK->${col.referencedTable}.${col.referencedColumn}`
                    : "",
                  col.columnDefault ? `DEFAULT=${col.columnDefault}` : "",
                ]
                  .filter(Boolean)
                  .join(",");

                return `${col.name} (${col.dataType}${
                  constraints ? ` [${constraints}]` : ""
                })`;
              })
              .join(", ");

            const indexes = table.indexes
              ?.filter((idx) => !idx.isPrimary)
              .map(
                (idx: Index) =>
                  `${idx.isUnique ? "UQ" : "IDX"} ${
                    idx.name
                  }(${idx.columns.join(",")})`
              )
              .join(", ");

            return (
              `Table ${table.name}${
                table.comment ? ` - ${table.comment}` : ""
              }:\n` +
              `Columns: {${columns}}${indexes ? `\nIndexes: {${indexes}}` : ""}`
            );
          })
          .join("\n\n");
        return `Schema "${schema.name}":\n${tableSummaries}`;
      })
      .join("\n\n");
  return formattedSchema;
}

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

  const formattedSchema = formatDatabaseSchema(databaseStructure);

  const systemPrompt = {
    role: "system",
    content: `You are a SQL Editor Assistant specializing in ${dbType}. Focus on writing, analyzing, and fixing SQL queries.

  CONTEXT:
  Database Schema:
  ${formattedSchema}
  ${editorValue ? `Active Query:\n${editorValue}` : ""}
  ${editorError ? `Current Error:\n${editorError}` : ""}
  
  RULES:
  1. Schema Compliance
     - Only reference tables and columns from the provided schema
     - Use correct case sensitivity for identifiers
     - Include schema names in table references
  
  2. SQL Standards
     - Use double quotes for uppercase identifiers in PostgreSQL
     - Implement proper JOIN conditions
     - Write performant queries using appropriate indexes
     - Use LOWER(column) ILIKE LOWER('%term%') for text search
  
  3. Query Requirements
     - Write clear, maintainable SQL
     - Follow standard SQL formatting
     - Include proper table aliases
     - Handle NULL values appropriately
  
  4. Error Handling
     - Provide specific error fixes
     - Explain query problems concisely
     - Suggest query improvements`,
  };

  // Count and log tokens
  const allMessages = [systemPrompt, ...messages];
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
      chart: chartTool({
        userTier,
        supabase,
        user,
        messages,
        formattedSchemas: formattedSchema,
        dbType,
        connectionString,
        updatePromises,
      }),
    },
    messages: [systemPrompt, ...messages],
    maxTokens: 1000,
  });

  // Ensure usage updates are completed before returning
  await Promise.all(updatePromises);

  return result.toDataStreamResponse();
}
