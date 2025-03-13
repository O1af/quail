"use client";

import { useCallback, useRef, useEffect, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ArrowRightCircle, Sparkles, StopCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import useChartEditorStore from "@/components/stores/chartEditor_store";

export default function NaturalLanguageInput() {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  // Add a debounce ref to prevent excessive re-renders
  const processingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  // Manage prompt locally instead of in the store
  const [naturalLanguagePrompt, setNaturalLanguagePrompt] = useState("");

  const {
    currJsx,
    chartData,
    isStreaming,
    processIncomingMessage,
    setIsStreaming,
    setNewJsx,
  } = useChartEditorStore();

  // Setup chat with the chart editor API
  const { messages, append, status, stop } = useChat({
    initialMessages: [],
    api: "/api/chartEditor",
    body: {
      jsxCode: currJsx,
      types: chartData?.data?.types || [],
      rowCount: chartData?.data?.rowCount || 0,
      query: chartData?.query,
    },
    onFinish: (message) => {
      if (message.content) {
        processIncomingMessage(message.content);
      }
      setIsStreaming(false);
    },
    onError: (error) => {
      console.error("Chat error:", error);
      setIsStreaming(false);
    },
  });

  // Process incoming assistant message during streaming
  useEffect(() => {
    if (status === "streaming" && messages.length > 0) {
      // Clear any existing timeout
      if (processingTimeoutRef.current) {
        clearTimeout(processingTimeoutRef.current);
      }

      // Set a new timeout to process the message (debounce)
      processingTimeoutRef.current = setTimeout(() => {
        const assistantMessage = messages.find((m) => m.role === "assistant");
        if (assistantMessage?.content) {
          processIncomingMessage(assistantMessage.content);
        }
      }, 100); // Short debounce for responsive updates
    }

    // Cleanup timeout on unmount or when dependencies change
    return () => {
      if (processingTimeoutRef.current) {
        clearTimeout(processingTimeoutRef.current);
      }
    };
  }, [messages, status, processIncomingMessage]);

  // Sync isProcessing state with the store
  useEffect(() => {
    const isProcessing = status === "streaming" || status === "submitted";

    if (isProcessing !== isStreaming) {
      setIsStreaming(isProcessing);
    }
  }, [status, isStreaming, setIsStreaming]);

  const isProcessing = status === "streaming" || status === "submitted";
  const canSubmit = naturalLanguagePrompt.trim().length > 0 && !isProcessing;

  // Auto-resize textarea based on content
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = "auto";
    const newHeight = Math.min(Math.max(textarea.scrollHeight, 24), 100);
    textarea.style.height = `${newHeight}px`;
  }, [naturalLanguagePrompt]);

  // Handle Enter key press
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (
        e.key === "Enter" &&
        !e.shiftKey &&
        naturalLanguagePrompt.trim() &&
        !isProcessing
      ) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [naturalLanguagePrompt, isProcessing]
  );

  // Submit the prompt
  const handleSubmit = async () => {
    if (!naturalLanguagePrompt.trim() || isProcessing) return;

    try {
      // Set streaming mode and reset newJsx before starting the request
      setIsStreaming(true);
      setNewJsx(null); // Clear any existing newJsx before streaming starts

      // Send the prompt
      await append({
        role: "user",
        content: naturalLanguagePrompt,
      });

      setNaturalLanguagePrompt("");
    } catch (error) {
      console.error("Failed to send prompt:", error);
      setIsStreaming(false);
    }
  };

  // Stop generation
  const handleStop = () => {
    stop();
    setIsStreaming(false);
  };

  return (
    <div className="relative w-full max-w-full">
      <div
        className={cn(
          "relative rounded-full border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/90 shadow-lg backdrop-blur-sm",
          "transition-opacity duration-200",
          !isFocused && !isProcessing && !naturalLanguagePrompt
            ? "opacity-70"
            : "opacity-100"
        )}
      >
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground">
          <Sparkles className="h-4 w-4" />
        </div>

        <Textarea
          ref={textareaRef}
          placeholder="Describe chart changes in natural language..."
          value={naturalLanguagePrompt}
          onChange={(e) => setNaturalLanguagePrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={isProcessing}
          className="pl-10 pr-12 rounded-full border-0 shadow-none bg-transparent resize-none min-h-[40px] max-h-[100px] py-3 overflow-y-auto focus-visible:ring-0 focus-visible:ring-offset-0"
          rows={1}
        />

        <div className="absolute right-2.5 top-1/2 transform -translate-y-1/2 transition-all duration-200">
          {isProcessing ? (
            <Button
              type="button"
              size="sm"
              onClick={handleStop}
              variant="destructive"
              className={cn(
                "h-7 w-7 rounded-full p-0",
                "bg-gradient-to-br from-rose-400 to-red-500",
                "hover:from-rose-500 hover:to-red-600",
                "text-white shadow-sm",
                "transition-all duration-200 ease-in-out",
                "dark:from-rose-500 dark:to-red-600",
                "dark:hover:from-rose-600 dark:hover:to-red-700"
              )}
            >
              <StopCircle className="h-4 w-4" />
              <span className="sr-only">Stop generating</span>
            </Button>
          ) : (
            <Button
              type="button"
              size="sm"
              disabled={!canSubmit}
              onClick={() => canSubmit && handleSubmit()}
              className={cn(
                "h-7 w-7 rounded-full p-0",
                "bg-gradient-to-br from-blue-400 to-indigo-500",
                "hover:from-blue-500 hover:to-indigo-600",
                "text-white shadow-sm",
                "transition-all duration-200 ease-in-out",
                "dark:from-blue-500 dark:to-indigo-600",
                "dark:hover:from-blue-600 dark:hover:to-indigo-700",
                "disabled:from-gray-200 disabled:to-gray-300",
                "disabled:dark:from-gray-700 disabled:dark:to-gray-800",
                "disabled:text-gray-400 disabled:dark:text-gray-500",
                "disabled:cursor-not-allowed disabled:opacity-70"
              )}
            >
              <ArrowRightCircle className="h-4 w-4" />
              <span className="sr-only">Send message</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
