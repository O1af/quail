import { appendResponseMessages, streamText } from "ai";
import { createAzure } from "@ai-sdk/azure";
import { createClient } from "@/utils/supabase/server";
import { saveChat, deleteChat } from "@/components/stores/chat_store";
import { generateTitleFromUserMessage } from "./title";

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

  const { messages, id } = await req.json();
  const title =
    messages.length === 1
      ? await generateTitleFromUserMessage({ message: messages[0], azure })
      : undefined;

  const stream = streamText({
    model: azure("gpt-4o"),
    system: "You are a helpful assistant.",
    messages,
    maxTokens: 300,
    async onFinish({ response }) {
      const allMessages = appendResponseMessages({
        messages,
        responseMessages: response.messages,
      });
      await saveChat(id, allMessages, user.user.id, title);
    },
  });

  return stream.toDataStreamResponse();
}

export async function DELETE(req: Request) {
  const supabase = await createClient();
  const { data: user, error } = await supabase.auth.getUser();

  if (error || !user) {
    return new Response(JSON.stringify({ message: "Unauthorized" }), {
      status: 401,
    });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return new Response(JSON.stringify({ message: "Missing chat ID" }), {
      status: 400,
    });
  }

  try {
    await deleteChat(id, user.user.id);
    return new Response(JSON.stringify({ success: true }));
  } catch (error) {
    return new Response(JSON.stringify({ message: "Failed to delete chat" }), {
      status: 500,
    });
  }
}
