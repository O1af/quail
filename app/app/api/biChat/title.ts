import { AzureOpenAIProvider } from "@ai-sdk/azure";
import { Message } from "ai";
import { generateText } from "ai";

export async function generateTitleFromUserMessage({
  message,
  azure,
}: {
  message: Message;
  azure: AzureOpenAIProvider;
}) {
  const { text: title } = await generateText({
    model: azure("gpt-4o-mini"),
    system: `\n
      - you will generate a short title based on the first message a user begins a conversation with
      - ensure it is not more than 80 characters long
      - the title should be a summary of the user's message
      - do not use quotes or colons`,
    prompt: JSON.stringify(message),
  });

  return title;
}
