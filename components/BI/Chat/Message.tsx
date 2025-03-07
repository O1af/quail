"use client";

import { type Message as AIMessage, TextPart, ToolInvocation } from "ai";
import { motion } from "framer-motion";
import { AvatarImage, Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { Markdown } from "@/components/Dev/ChatBot/markdown";
import { DataVisAgentResult } from "../AgentResult/DataVisAgentResult";
import { useMemo } from "react";

export interface MessageProps {
  message: AIMessage;
}

export function Message({ message }: MessageProps) {
  const { theme } = useTheme();
  const avatarSrc = theme === "dark" ? "/boticondark.png" : "/boticonlight.png";

  // Memoize message content extraction for performance
  const { textContent, chartJsx, query, resultData } = useMemo(() => {
    // Extract text content
    const text = message.parts
      ?.filter((part): part is TextPart => part.type === "text")
      .map((part) => part.text)
      .join("");

    // Extract tool invocations with proper typing
    const toolInvocations = message.parts
      ?.filter(
        (
          part
        ): part is {
          type: "tool-invocation";
          toolInvocation: ToolInvocation;
        } => part.type === "tool-invocation"
      )
      .map((part) => part.toolInvocation);

    // Find completed DataVisAgent result
    const lastResult = toolInvocations?.find(
      (tool): tool is ToolInvocation & { state: "result"; result: any } =>
        tool.state === "result" && tool.toolName === "DataVisAgent"
    )?.result;

    return {
      textContent: text,
      chartJsx: lastResult?.chartJsx as string,
      query: lastResult?.query as string | undefined,
      resultData: lastResult?.data,
    };
  }, [message.parts]);

  const hasVisualization = Boolean(chartJsx || resultData || query);

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
            "flex flex-col gap-4 w-full",
            message.role === "user" ? "items-end" : "items-start"
          )}
        >
          {hasVisualization && (
            <div className="w-full">
              <DataVisAgentResult
                chartJsx={chartJsx}
                data={resultData}
                query={query}
              />
            </div>
          )}
          {textContent && (
            <div
              className={cn(
                "max-w-xl rounded-xl p-2",
                message.role === "user"
                  ? "bg-primary text-primary-foreground ml-auto"
                  : "bg-muted"
              )}
            >
              <Markdown>{textContent}</Markdown>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
