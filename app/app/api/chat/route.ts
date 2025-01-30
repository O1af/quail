import { streamText, Message } from "ai";
import { createAzure } from "@ai-sdk/azure";
import { createClient } from "@/utils/supabase/server";
import { Column, Schema, Table } from "@/components/stores/table_store";
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
  console.log(editorError);
  const systemPrompt = {
    role: "system",
    content: `SQL (${dbType}) Expert Assistant

    CONTEXT:
    Database: ${dbType}
    Schema: ${formattedSchemas}
    ${editorValue ? `Active Query:\n${editorValue}\n` : ""}
    ${editorError ? `Current Error:\n${editorError}\n` : ""}

    CAPABILITIES & RULES:
    • Query Analysis & Optimization
    • Error Resolution
    • Schema Validation
    • Performance Tuning
    • Text Search: LOWER(column) ILIKE LOWER('%term%')
    • Proper JOIN usage
    • Index-aware queries

    OUTPUT:
    1. Analysis/Solution
    2. Optimized Query
    3. Performance Notes
    ${editorError ? "4. Error Resolution\n" : ""}`,
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
        formattedSchemas,
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
