import { streamText, Message } from "ai";
import { createAzure } from "@ai-sdk/azure";
import { createClient } from "@/utils/supabase/server";
import { unstable_noStore as noStore } from "next/cache";
import {
  getTier,
  updateTokenUsage,
  updateUsage,
  getCurrentUsageColumn,
  getModelName,
} from "@/utils/metrics/AI";
import { formatDatabaseSchema } from "../biChat/utils/format";

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

  const result = streamText({
    model: azure(getModelName(userTier)),
    messages: [systemPrompt, ...messages],
    maxTokens: 1000,
    async onFinish({ usage }) {
      console.log("Response usage:", usage.totalTokens);

      // Update token usage and general usage with actual usage data from the response
      try {
        await updateTokenUsage(
          supabase,
          user.user.id,
          getCurrentUsageColumn(),
          usage.totalTokens,
          userTier
        );

        await updateUsage(
          supabase,
          user.user.id,
          getCurrentUsageColumn(),
          userTier
        );
      } catch (error) {
        console.error("Failed to update usage metrics:", error);
      }
    },
  });

  return result.toDataStreamResponse();
}
