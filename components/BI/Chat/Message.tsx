"use client";

import { type Message as AIMessage, TextPart, ToolInvocation } from "ai";
import { motion } from "framer-motion";
import { AvatarImage, Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { Markdown } from "@/components/Dev/ChatBot/markdown";
import { DataVisAgentResult } from "../AgentResult/DataVisAgentResult";
import { useMemo } from "react";
import { ChartData } from "@/lib/types/stores/chart";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export interface MessageProps {
  message: AIMessage;
  savedCharts: Array<{ _id: string; title: string; updatedAt: Date }>;
}

export function Message({ message, savedCharts }: MessageProps) {
  const { resolvedTheme } = useTheme();

  // Memoize message content extraction for performance
  const { textContent, visualizationData, errorData } = useMemo(() => {
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

    // Prepare visualization data only if all required fields are present
    let vizData = null;
    let errorData = null;

    if (lastResult?.error) {
      // Handle error result
      errorData = {
        error: lastResult.error,
        query: lastResult.query,
      };
    } else if (
      lastResult?.chartJsx &&
      lastResult?.data &&
      lastResult?.query &&
      lastResult?.chartId
    ) {
      // Handle successful visualization
      vizData = {
        chartData: {
          chartJsx: lastResult.chartJsx,
          title: lastResult.chartTitle,
          data: lastResult.data,
          query: lastResult.query,
        } as ChartData,
        chartId: lastResult.chartId,
      };
    }

    return {
      textContent: text,
      visualizationData: vizData,
      errorData,
    };
  }, [message.parts]);

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
          <Avatar className="w-12 h-12">
            <AvatarImage
              src="/quail_logo.svg"
              alt="AI"
              className={resolvedTheme === "dark" ? "brightness-0 invert" : ""}
            />
          </Avatar>
        )}

        <div
          className={cn(
            "flex flex-col gap-4 w-full",
            message.role === "user" ? "items-end" : "items-start"
          )}
        >
          {errorData && (
            <Alert variant="destructive" className="w-full">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription className="mt-2">
                {errorData.error}
                {errorData.query && (
                  <div className="mt-2">
                    <div className="font-semibold">Query attempted:</div>
                    <pre className="text-xs p-2 bg-muted/50 rounded-md overflow-x-auto mt-1">
                      {errorData.query}
                    </pre>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}
          {visualizationData && (
            <div className="w-full">
              <DataVisAgentResult
                chartData={visualizationData.chartData}
                chartId={visualizationData.chartId}
                savedCharts={savedCharts}
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
