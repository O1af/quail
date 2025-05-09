"use client";

import { useCallback, useRef, useEffect, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ArrowRightCircle, GripHorizontal, StopCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import useChartEditorStore from "@/components/stores/chartEditor_store";
import { useChartData } from "@/lib/hooks/use-chart-data"; // Import useChartData
import Draggable, { DraggableEventHandler } from "react-draggable"; // Import DraggableEventHandler

export default function NaturalLanguageInput() {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const nodeRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const processingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [naturalLanguagePrompt, setNaturalLanguagePrompt] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [hasBeenDragged, setHasBeenDragged] = useState(false);

  // Get UI state and actions from Zustand store
  const {
    currJsx, // Current JSX to send as context
    isStreaming, // Read isStreaming state from store
    processIncomingMessage,
    setIsStreaming, // Action to set streaming state
    setNewJsx,
    chartId, // Get chartId from store
  } = useChartEditorStore();

  // Fetch chart data using React Query - enabled only if chartId is valid
  const { data: chartQueryResult, isLoading: dataIsLoading } = useChartData(
    chartId && chartId !== "new" ? chartId : null
  );

  // Extract data needed for the AI context
  const chartContext = {
    jsxCode: currJsx,
    types: chartQueryResult?.chartData?.data?.types || [],
    rowCount: chartQueryResult?.chartData?.data?.rowCount || 0,
    query: chartQueryResult?.chartData?.query,
  };

  // Setup chat with the chart editor API
  const {
    messages,
    append,
    status, // Keep status for local logic if needed (e.g., disabling input)
    stop,
    error: chatError,
  } = useChat({
    api: "/api/chartEditor",
    body: chartContext, // Pass the fetched context
    onFinish: (message) => {
      // This runs AFTER the stream finishes
      if (message.content) {
        // Update the store with the FINAL message content
        processIncomingMessage(message.content);
      }
      // Set streaming to false AFTER processing the final message
      // This ensures the store calculates showDiffView based on the final newJsx
      setIsStreaming(false);
    },
    onError: (error) => {
      console.error("Chat error:", error);
      // Ensure streaming stops on error
      setIsStreaming(false);
      // Optionally show a toast or message to the user
    },
    // No initial messages needed usually
  });

  // Process incoming assistant message during streaming (debounced)
  // This useEffect still updates newJsx during the stream for potential intermediate previews (though not currently used)
  useEffect(() => {
    if (status === "streaming" && messages.length > 0) {
      if (processingTimeoutRef.current) {
        clearTimeout(processingTimeoutRef.current);
      }
      processingTimeoutRef.current = setTimeout(() => {
        const lastMessage = messages[messages.length - 1];
        if (lastMessage?.role === "assistant" && lastMessage.content) {
          processIncomingMessage(lastMessage.content);
        }
      }, 100); // Debounce slightly
    }
    return () => {
      if (processingTimeoutRef.current) {
        clearTimeout(processingTimeoutRef.current);
      }
    };
  }, [messages, status, processIncomingMessage]);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    const newHeight = Math.min(Math.max(textarea.scrollHeight, 40), 100); // Min height 40px
    textarea.style.height = `${newHeight}px`;
  }, [naturalLanguagePrompt]);

  // Submit handler
  const handleSubmit = useCallback(async () => {
    const prompt = naturalLanguagePrompt.trim();
    // Read isStreaming directly from the store state for the check
    if (!prompt || isStreaming || dataIsLoading) return;

    // Set streaming mode and clear previous newJsx immediately
    // This is the primary place to set isStreaming = true
    setIsStreaming(true);
    setNewJsx(null);

    try {
      await append({ role: "user", content: prompt });
      setNaturalLanguagePrompt(""); // Clear input on successful append start
    } catch (error) {
      console.error("Failed to send prompt:", error);
      // Ensure streaming stops if append fails immediately
      setIsStreaming(false);
    }
  }, [
    naturalLanguagePrompt,
    isStreaming, // Read from store state
    dataIsLoading,
    append,
    setIsStreaming,
    setNewJsx,
  ]);

  // Handle Enter key press
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      // Read isStreaming directly from the store state for the check
      if (e.key === "Enter" && !e.shiftKey && !isStreaming && !dataIsLoading) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit, isStreaming, dataIsLoading] // Read from store state
  );

  // Stop generation
  const handleStop = useCallback(() => {
    stop();
    // Manually set streaming to false on stop, as onFinish/onError might not fire
    setIsStreaming(false);
  }, [stop, setIsStreaming]);

  // Drag handlers
  const handleDragStart: DraggableEventHandler = () => {
    setIsDragging(true);
    setHasBeenDragged(true);
  };
  // FIX: Ensure the function matches the expected signature (no return value needed from setTimeout)
  const handleDragStop: DraggableEventHandler = () => {
    setTimeout(() => setIsDragging(false), 0);
  };

  // Calculate default position (bottom-center)
  const getDefaultPosition = () => {
    if (hasBeenDragged || !containerRef.current || !nodeRef.current) {
      return undefined; // Use default or last dragged position
    }
    const containerWidth = containerRef.current.clientWidth;
    const nodeWidth = nodeRef.current.clientWidth || containerWidth * 0.5; // Estimate width if not rendered yet
    const nodeHeight = nodeRef.current.clientHeight || 50; // Estimate height
    return {
      x: containerWidth / 2 - nodeWidth / 2,
      y: containerRef.current.clientHeight - nodeHeight - 24, // 24px from bottom
    };
  };

  // Update position on resize if not dragged
  useEffect(() => {
    const updatePosition = () => {
      if (!hasBeenDragged) {
        // Force re-render to recalculate position
        setHasBeenDragged(false);
      }
    };
    window.addEventListener("resize", updatePosition);
    // Initial position calculation after mount
    const timer = setTimeout(updatePosition, 100);
    return () => {
      window.removeEventListener("resize", updatePosition);
      clearTimeout(timer);
    };
  }, [hasBeenDragged]);

  // Use store's isStreaming state for disabling elements and button state
  const isCurrentlyStreaming = isStreaming; // Use state from store
  const canSubmit =
    naturalLanguagePrompt.trim().length > 0 &&
    !isCurrentlyStreaming &&
    !dataIsLoading;

  return (
    <div ref={containerRef} className="absolute inset-0 pointer-events-none">
      <Draggable
        nodeRef={nodeRef as React.RefObject<HTMLElement>}
        handle=".drag-handle"
        bounds="parent"
        onStart={handleDragStart}
        onStop={handleDragStop} // Use corrected handler
        position={getDefaultPosition()} // Use calculated position
        // key forces re-render when position needs recalculation (e.g., on resize)
        key={hasBeenDragged ? "dragged" : "initial"}
      >
        <div
          ref={nodeRef}
          className={cn(
            "absolute z-50 w-11/12 sm:w-3/4 md:w-1/2 max-w-xl pointer-events-auto", // Adjusted width
            "transition-opacity duration-300 ease-in-out",
            !isFocused && !isCurrentlyStreaming && !naturalLanguagePrompt // Use store state
              ? "opacity-80 hover:opacity-100"
              : "opacity-100"
          )}
          style={{ cursor: isDragging ? "grabbing" : "default" }}
        >
          <div
            className={cn(
              "relative rounded-full border border-input dark:border-zinc-700",
              "bg-background/80 dark:bg-zinc-800/80 shadow-lg backdrop-blur-sm" // Use background color
            )}
          >
            {/* Drag Handle */}
            <div
              className="absolute left-0 top-0 bottom-0 flex items-center pl-3 text-muted-foreground drag-handle cursor-grab"
              title="Drag to move"
            >
              <GripHorizontal className="h-4 w-4" />
            </div>

            {/* Textarea */}
            <Textarea
              ref={textareaRef}
              placeholder="Describe chart changes (e.g., 'change to bar chart', 'color bars red')"
              value={naturalLanguagePrompt}
              onChange={(e) => setNaturalLanguagePrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              disabled={isCurrentlyStreaming || dataIsLoading} // Use store state
              className="pl-10 pr-12 rounded-full border-0 shadow-none bg-transparent resize-none min-h-[40px] max-h-[100px] py-2.5 overflow-y-auto focus-visible:ring-0 focus-visible:ring-offset-0 text-sm" // Adjusted padding/height
              rows={1}
            />

            {/* Action Button (Submit/Stop) */}
            <div className="absolute right-2.5 top-1/2 transform -translate-y-1/2">
              {isCurrentlyStreaming ? ( // Use store state
                <Button
                  type="button"
                  size="icon" // Use icon size
                  onClick={handleStop}
                  variant="destructive"
                  className="h-7 w-7 rounded-full" // Explicit size
                  title="Stop generating"
                >
                  <StopCircle className="h-4 w-4" />
                  <span className="sr-only">Stop</span>
                </Button>
              ) : (
                <Button
                  type="button"
                  size="icon" // Use icon size
                  disabled={!canSubmit} // Use derived state
                  onClick={handleSubmit}
                  className={cn(
                    "h-7 w-7 rounded-full", // Explicit size
                    "bg-primary text-primary-foreground hover:bg-primary/90", // Primary button style
                    "disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-70"
                  )}
                  title="Send message"
                >
                  <ArrowRightCircle className="h-4 w-4" />
                  <span className="sr-only">Send</span>
                </Button>
              )}
            </div>
          </div>
          {chatError && (
            <p className="text-xs text-destructive mt-1 px-4">
              Error: {chatError.message}
            </p>
          )}
        </div>
      </Draggable>
    </div>
  );
}
