import { streamText } from "ai";
import { createAzure } from "@ai-sdk/azure";
import { createClient } from "@/utils/supabase/server";
import { useTableStore } from "@/components/stores/table_store";

const azure = createAzure({
  resourceName: process.env.AZURE_RESOURCE_NAME, // Azure resource name
  apiKey: process.env.AZURE_API_KEY, // Azure API key
});

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  console.log("Post req made:");
  const supabase = createClient();
  const { data: user, error } = await supabase.auth.getUser();

  if (error || !user) {
    return new Response(JSON.stringify({ message: "Unauthorized" }), {
      status: 401,
    });
  }

  const { messages } = await req.json();
  const systemPrompt = {
    role: "system",
    content:
      "You are a SQL (postgres) and data visualization expert. Your job is to help the user write a SQL query to retrieve the data they need. The table schema is as follows:",
  };

  const promptMessage = {
    role: "user",
    content: "Provide the necessary response to fulfill the user's request.",
  };

  // Get the database schema from Zustand store
  const databaseSchema = useTableStore.getState().databaseStructure;

  if (!databaseSchema || databaseSchema.schemas.length === 0) {
    console.error("Database Schema is empty or not initialized");
    console.log("Current Zustand state:", useTableStore.getState());
  } else {
    console.log("Database Schema:", databaseSchema);
  }

  const result = streamText({
    model: azure("gpt-4o-mini"),
    messages: [systemPrompt, promptMessage, ...messages],
    maxTokens: 1000,
  });

  return result.toDataStreamResponse();
}
