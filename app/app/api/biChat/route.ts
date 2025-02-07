import { appendResponseMessages, streamText } from "ai";
import { createAzure } from "@ai-sdk/azure";
import { createClient } from "@/utils/supabase/server";
import { saveChat, createChat } from "@/components/stores/chat_store";

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

  // Only create a new chat if this is the first message
  let chatId = id;
  if (id === "new" && messages.length === 1) {
    chatId = await createChat(user.user.id);
  } else if (id === "new") {
    chatId = id;
  }

  const stream = streamText({
    model: azure("gpt-4o"),
    system: "You are a helpful assistant.",
    messages,
    maxTokens: 300,
    async onFinish({ response, usage }) {
      if (chatId !== "new") {
        const allMessages = appendResponseMessages({
          messages,
          responseMessages: response.messages,
        });
        await saveChat(chatId, allMessages, user.user.id);
      }
    },
  });

  const headers = new Headers({
    "X-Chat-Id": chatId,
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });

  return new Response(stream.toDataStream(), { headers });
}
