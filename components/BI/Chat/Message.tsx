"use client";

import { type Message as AIMessage, TextPart, ToolInvocation } from "ai";
import { motion } from "framer-motion";
import { AvatarImage, Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { Markdown } from "@/components/Dev/ChatBot/markdown";
import { DynamicChart } from "@/components/BI/Charts/dynamic-chartjs";
import { ChartConfiguration } from "@/lib/types/BI/chart";

export interface MessageProps {
  message: AIMessage;
}

function ChartErrorFallback({ error }: { error: Error }) {
  return (
    <div className="w-full max-w-2xl p-4 text-sm text-red-500 bg-red-50 dark:bg-red-950/20 rounded-xl">
      Failed to render chart: {error.message}
    </div>
  );
}

export function Message({ message }: MessageProps) {
  const { theme } = useTheme();
  const avatarSrc = theme === "dark" ? "/boticondark.png" : "/boticonlight.png";

  // Process message parts or fallback to content
  const parts = message.parts;

  // Extract text content
  const textContent = parts
    ?.filter((part): part is TextPart => part.type === "text")
    .map((part) => part.text)
    .join("");

  // Extract tool invocations and results with proper typing
  const toolInvocations = parts
    ?.filter(
      (
        part
      ): part is { type: "tool-invocation"; toolInvocation: ToolInvocation } =>
        part.type === "tool-invocation"
    )
    .map((part) => part.toolInvocation);

  // Find completed dataAgent result with proper typing
  const dataAgentResult = toolInvocations?.find(
    (tool): tool is ToolInvocation & { state: "result"; result: any } =>
      tool.state === "result" && tool.toolName === "dataAgent"
  )?.result;

  const visualization = dataAgentResult?.visualization as
    | ChartConfiguration
    | undefined;
  const query = dataAgentResult?.query as string | undefined;

  // Debug logging
  if (parts) console.log("Message parts:", parts);
  if (toolInvocations) console.log("Tool invocations:", toolInvocations);
  if (dataAgentResult) console.log("Data agent result:", dataAgentResult);
  if (visualization) console.log("Visualization config:", visualization);

  return (
    <motion.div
      className={cn(
        "w-full max-w-3xl mx-auto",
        message.role === "user" ? "ml-auto" : "mr-auto"
      )}
      initial={{ y: 5, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      data-role={message.role}
    >
      <div
        className={cn(
          "flex gap-4 w-full",
          message.role === "user" ? "flex-row-reverse" : "flex-row"
        )}
      >
        {message.role === "assistant" && (
          <Avatar className="w-8 h-8">
            <AvatarImage src={avatarSrc} alt="AI" />
          </Avatar>
        )}

        <div
          className={cn(
            "flex flex-col gap-4",
            message.role === "user" ? "items-end" : "items-start"
          )}
        >
          <div
            className={cn(
              "max-w-xl rounded-xl p-2",
              message.role === "user"
                ? "bg-primary text-primary-foreground ml-auto"
                : "bg-muted"
            )}
          >
            <Markdown>{textContent ?? ""}</Markdown>
          </div>

          {visualization && (
            <div className="w-full max-w-2xl bg-card rounded-xl p-4 shadow-sm">
              <DynamicChart
                config={visualization}
                className="w-full aspect-[16/9]"
              />
            </div>
          )}

          {query && (
            <div className="w-full max-w-2xl">
              <details className="text-sm text-muted-foreground">
                <summary className="cursor-pointer hover:text-foreground">
                  Show SQL Query
                </summary>
                <pre className="mt-2 p-2 rounded bg-muted/50 overflow-x-auto">
                  <code>{query}</code>
                </pre>
              </details>
            </div>
          )}

          {toolInvocations?.map(
            (tool) =>
              tool.state === "call" && (
                <div
                  key={tool.toolCallId}
                  className="text-sm text-muted-foreground italic"
                >
                  Processing {tool.toolName}...
                </div>
              )
          )}
        </div>
      </div>
    </motion.div>
  );
}
