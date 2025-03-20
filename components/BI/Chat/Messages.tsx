"use client";

import { JSONValue, type Message } from "ai";
import { AnimatePresence } from "framer-motion";
import { memo, useEffect, useMemo, useState } from "react";
import { useScrollToBottom } from "@/components/Dev/ChatBot/use-scroll-to-bottom";
import { Message as MessageComponent } from "./Message";
import { listCharts } from "@/components/stores/chart_store";
import { createClient } from "@/utils/supabase/client";
import { StatusMessage } from "./StatusMessage";

interface MessagesProps {
  messages: Message[];
  status?: "submitted" | "streaming" | "ready" | "error";
  data?: JSONValue[] | undefined;
}

// Memoize individual message items to prevent each from re-rendering
const MemoizedMessageComponent = memo(MessageComponent);

function PureMessages({ messages, status, data }: MessagesProps) {
  const [messagesContainerRef, messagesEndRef] =
    useScrollToBottom<HTMLDivElement>();
  const [savedCharts, setSavedCharts] = useState<
    Array<{ _id: string; title: string; updatedAt: Date }>
  >([]);

  // Fetch saved charts when component mounts
  useEffect(() => {
    async function fetchCharts() {
      try {
        const supabase = await createClient();
        const { data: userData } = await supabase.auth.getUser();

        if (userData.user) {
          const charts = await listCharts(userData.user.id);
          setSavedCharts(charts);
        }
      } catch (error) {
        console.error("Failed to fetch charts:", error);
      }
    }

    fetchCharts();
  }, []);

  const currentStepData = data?.[data.length - 1];
  const currentStep = typeof currentStepData === "number" ? currentStepData : 0;
  // Show status when streaming or submitted and there's step data
  const showStatus =
    (status === "streaming" || status === "submitted") &&
    currentStepData !== undefined;

  // Filter out the last message if it's an empty assistant message while status is showing
  const displayMessages = useMemo(() => {
    if (!showStatus) return messages;

    // If we're showing a status and the last message is from the assistant
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.role === "assistant") {
      // Check if it's an empty message (no parts or empty text parts)
      const isEmpty =
        !lastMessage.parts?.length ||
        lastMessage.parts.every(
          (part) =>
            part.type === "text" && (!part.text || part.text.trim() === "")
        );

      if (isEmpty) {
        // Return all messages except the last one
        return messages.slice(0, -1);
      }
    }

    return messages;
  }, [messages, showStatus]);

  return (
    <div
      ref={messagesContainerRef}
      className="absolute inset-0 flex flex-col overflow-y-auto scroll-smooth"
    >
      <div className="flex flex-col gap-6 px-4 py-4">
        {displayMessages.map((message) => (
          <AnimatePresence key={message.id} mode="wait">
            <MemoizedMessageComponent
              message={message}
              savedCharts={savedCharts}
            />
          </AnimatePresence>
        ))}

        {showStatus && <StatusMessage step={currentStep} />}
      </div>

      <div ref={messagesEndRef} className="h-px w-full" />
    </div>
  );
}

// Optimize memo comparison to only check relevant changes
export const Messages = memo(PureMessages, (prevProps, nextProps) => {
  if (prevProps.status !== nextProps.status) return false;
  if (prevProps.messages.length !== nextProps.messages.length) return false;

  // Only do deep comparison of data if needed
  if (prevProps.data !== nextProps.data) {
    const prevDataString = JSON.stringify(prevProps.data);
    const nextDataString = JSON.stringify(nextProps.data);
    if (prevDataString !== nextDataString) return false;
  }

  // Check if any messages changed
  for (let i = 0; i < prevProps.messages.length; i++) {
    if (
      prevProps.messages[i].id !== nextProps.messages[i].id ||
      JSON.stringify(prevProps.messages[i].parts) !==
        JSON.stringify(nextProps.messages[i].parts)
    ) {
      return false;
    }
  }

  return true;
});
