import {
  appendResponseMessages,
  streamText,
  smoothStream,
  createDataStreamResponse,
} from "ai";
import { createAzure } from "@ai-sdk/azure";
import { createClient } from "@/utils/supabase/server";
import { saveChat, deleteChat } from "@/components/stores/chat_store";
import { generateTitleFromUserMessage } from "./utils/title";
import { DataVisAgentTool } from "./DataVisAgent";
import { tryCatch } from "@/lib/trycatch";
import { createAgentPrompt } from "./prompts/mainAgent";
import { updateStatus } from "./utils/workflow";
import { optimizeMessages } from "./utils/format";

const azure = createAzure({
  resourceName: process.env.NEXT_PUBLIC_AZURE_RESOURCE_NAME, // Azure resource name
  apiKey: process.env.NEXT_PUBLIC_AZURE_API_KEY, // Azure API key
});

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

// Allow streaming responses up to 120 seconds
export const maxDuration = 120;

export async function POST(req: Request) {
  const { data: authData, error: authError } = await tryCatch(
    createClient().then((sb) => sb.auth.getUser())
  );

  if (authError || !authData.data?.user) {
    return new Response(JSON.stringify({ message: "Unauthorized" }), {
      status: 401,
    });
  }

  const user = authData.data;

  if (!user?.user) {
    throw new Error("User not authenticated");
  }
  const {
    messages,
    databaseStructure,
    dbType,
    connectionString,
    userTier,
    id,
  } = await req.json();

  return createDataStreamResponse({
    async execute(dataStream) {
      // First, update with understanding status
      await updateStatus(dataStream, "Understanding your request...", {
        messageCount: messages.length,
      });

      const { data: title, error: titleError } =
        messages.length === 1
          ? await tryCatch(
              generateTitleFromUserMessage({ message: messages[0], azure })
            )
          : { data: undefined, error: null };

      const stream = streamText({
        model: azure("gpt-4o"),
        // Use agent prompt instead of system message for more contextual guidance
        prompt: createAgentPrompt({
          messages: optimizeMessages(messages),
          dbType,
          databaseStructure,
        }),
        // System message now provides identity and general behavior
        system:
          "You are an expert data analyst AI assistant. Answer questions concisely and accurately. For data requests, use the DataVisAgent tool.",
        experimental_transform: smoothStream({ chunking: "word" }),
        maxTokens: 1000,
        tools: {
          DataVisAgent: DataVisAgentTool({
            userTier,
            supabase: await createClient(),
            messages,
            dbType,
            connectionString,
            dbSchema: databaseStructure,
            provider: azure,
            stream: dataStream,
          }),
        },
        async onFinish({ response }) {
          const { error: saveError } = await tryCatch(
            saveChat(
              id,
              appendResponseMessages({
                messages,
                responseMessages: response.messages,
              }),
              user.user.id,
              title ?? undefined
            )
          );

          if (saveError) {
            dataStream.writeData({
              status: "Failed to save chat",
            });
            return;
          }

          await updateStatus(dataStream, "Response completed successfully.");
        },
      });

      stream.mergeIntoDataStream(dataStream);
    },
    onError(error) {
      return error instanceof Error
        ? error.message
        : "An unexpected error occurred";
    },
  });
}
