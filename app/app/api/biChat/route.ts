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
import { createAgentPrompt, createSystemPrompt } from "./prompts/mainAgent";
import { updateStatus } from "./utils/workflow";
import { optimizeMessages } from "./utils/format";
import { type SpeedMode } from "@/components/stores/table_store";
import {
  getTier,
  updateTokenUsage,
  updateUsage,
  getCurrentUsageColumn,
} from "@/utils/metrics/AI"; // Added import

const azure = createAzure({
  resourceName: process.env.NEXT_PUBLIC_AZURE_RESOURCE_NAME, // Azure resource name
  apiKey: process.env.NEXT_PUBLIC_AZURE_API_KEY, // Azure API key
  apiVersion: "2025-02-01-preview",
});

/**
 * Select the appropriate model based on speed mode
 * - slow: o3-mini (more accurate but slower)
 * - fast/medium: gpt-4o-mini (faster but may be less accurate)
 */
function getModelBySpeedMode(speedMode: SpeedMode = "medium") {
  if (speedMode === "slow") {
    return azure("o3-mini");
  } else {
    return azure("gpt-4o-mini");
  }
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

// Allow streaming responses up to 120 seconds
export const maxDuration = 120;

export async function POST(req: Request) {
  const supabase = await createClient(); // Moved supabase client creation up
  const { data: authData, error: authError } = await tryCatch(
    supabase.auth.getUser() // Use the already created client
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
    // userTier, // Removed as we fetch it above
    speedMode,
    id,
  } = await req.json();

  // Verify database connection information is present
  if (!connectionString || !dbType) {
    return new Response(
      JSON.stringify({
        message:
          "No database connection available. Please select a database from the settings.",
      }),
      { status: 400 }
    );
  }

  return createDataStreamResponse({
    async execute(dataStream) {
      // First, update with understanding status (step 0)
      await updateStatus(dataStream, 0);

      const { data: title, error: titleError } =
        messages.length === 1
          ? await tryCatch(
              generateTitleFromUserMessage({ message: messages[0], azure })
            )
          : { data: undefined, error: null };

      // Select model based on speed mode
      const modelToUse = getModelBySpeedMode(speedMode);

      const stream = streamText({
        model: modelToUse,
        prompt: createAgentPrompt({
          messages: optimizeMessages(messages),
          dbType,
          databaseStructure,
        }),
        system: createSystemPrompt(dbType),
        experimental_transform: smoothStream({ chunking: "word" }),
        onError(error) {
          console.log("Error in request:", error);
        },
        tools: {
          DataVisAgent: DataVisAgentTool({
            supabase: supabase, // Pass the existing supabase client
            messages,
            dbType,
            connectionString,
            dbSchema: databaseStructure,
            provider: azure,
            stream: dataStream,
          }),
        },
        async onFinish({ response, usage }) { // Added usage parameter
          // Update token usage and general usage
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
            // Optionally inform the client about the usage update failure
            dataStream.writeData({
              status: "Failed to update usage metrics",
            });
          }

          // Save the chat
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
