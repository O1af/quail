import { streamText } from "ai";
import { createAzure } from "@ai-sdk/azure";
import { createClient } from "@/utils/supabase/server";

const azure = createAzure({
  resourceName: process.env.AZURE_RESOURCE_NAME, // Azure resource name
  apiKey: process.env.AZURE_API_KEY, // Azure API key
});

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const supabase = createClient();
  const { data: user, error } = await supabase.auth.getUser();

  if (error || !user) {
    return new Response(JSON.stringify({ message: "Unauthorized" }), {
      status: 401,
    });
  }

  const { messages } = await req.json();

  const result = streamText({
    model: azure("gpt-4o-mini"),
    messages,
  });

  return result.toDataStreamResponse();
}
