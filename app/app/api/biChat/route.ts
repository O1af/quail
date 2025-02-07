import { streamText } from "ai";
import { createAzure } from "@ai-sdk/azure";
import { createClient } from "@/utils/supabase/server";

const azure = createAzure({
  resourceName: process.env.NEXT_PUBLIC_AZURE_RESOURCE_NAME, // Azure resource name
  apiKey: process.env.NEXT_PUBLIC_AZURE_API_KEY, // Azure API key
});

// Allow streaming responses up to 120 seconds
export const maxDuration = 120;

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: user, error } = await supabase.auth.getUser();

  if (error || !user) {
    return new Response(JSON.stringify({ message: "Unauthorized" }), {
      status: 401,
    });
  }
  const { messages, databaseStructure, dbType, connectionString } =
    await req.json();

  const result = streamText({
    model: azure("gpt-4o"),
    system: "You are a helpful assistant.",
    messages,
    maxTokens: 300,
  });

  return result.toDataStreamResponse();
}
