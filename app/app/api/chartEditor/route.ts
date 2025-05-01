import { createAzure } from "@ai-sdk/azure";
import { streamText, smoothStream } from "ai";
import { createClient } from "@/utils/supabase/server";
import { createChartEditPrompt } from "./editChartPrompt";
import { ColumnType } from "@/lib/types/DBQueryTypes";
import { Message } from "ai";

interface ChartEditRequest {
  messages: Message[];
  jsxCode: string;
  types: ColumnType[];
  rowCount: number;
  query: string;
}

const azure = createAzure({
  resourceName: process.env.NEXT_PUBLIC_AZURE_RESOURCE_NAME,
  apiKey: process.env.NEXT_PUBLIC_AZURE_API_KEY,
});

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: user, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return new Response(JSON.stringify({ message: "Unauthorized" }), {
      status: 401,
    });
  }

  try {
    // Extract the data from the request
    const { messages, jsxCode, types, rowCount, query }: ChartEditRequest =
      await req.json();

    // Get the user message - there should only be one
    const userMessage = messages[messages.length - 1] || {};

    if (!userMessage.content || !jsxCode || !types) {
      return new Response(
        JSON.stringify({
          message: "Missing required parameters",
        }),
        { status: 400 }
      );
    }

    // Stream the modified JSX
    const result = streamText({
      model: azure("gpt-4.1-mini"),
      prompt: createChartEditPrompt({
        prompt: userMessage.content,
        currentJsx: jsxCode,
        types,
        rowCount,
        query,
      }),
      maxTokens: 1000,
      temperature: 0, // Set to 0 for more deterministic output
      experimental_transform: smoothStream({ chunking: "line" }),
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error("Error in chart editor API:", error);
    return new Response(JSON.stringify({ message: "Server error" }), {
      status: 500,
    });
  }
}
