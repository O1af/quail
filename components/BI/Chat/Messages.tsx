"use client";

import { JSONValue, type Message } from "ai";
import { AnimatePresence } from "framer-motion";
import { memo } from "react";
import { useTheme } from "next-themes";
import { useScrollToBottom } from "@/components/Dev/ChatBot/use-scroll-to-bottom";
import { Message as MessageComponent } from "./Message";
import { Avatar } from "@/components/ui/avatar";
import { AvatarImage } from "@radix-ui/react-avatar";
import { motion } from "framer-motion";

interface MessagesProps {
  messages: Message[];
  isLoading?: boolean;
  data?: JSONValue[] | undefined;
}

// Memoize the status message to prevent re-render when unchanged
const StatusMessage = memo(
  ({ status }: { status: any }) => {
    const { theme } = useTheme();
    const avatarSrc =
      theme === "dark" ? "/boticondark.png" : "/boticonlight.png";

    return (
      <motion.div
        className="w-full max-w-3xl mx-auto"
        initial={{ y: 5, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex gap-4 items-center">
          <div className="size-8 flex items-center rounded-full justify-center ring-1 shrink-0 ring-border">
            <Avatar className="w-6 h-6">
              <AvatarImage src={avatarSrc} alt="AI" />
            </Avatar>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="h-1 w-1 rounded-full bg-current animate-pulse" />
            {String(status.status)}
          </div>
        </div>
      </motion.div>
    );
  },
  (prevProps, nextProps) =>
    JSON.stringify(prevProps.status) === JSON.stringify(nextProps.status)
);

// Memoize individual message items to prevent each from re-rendering
const MemoizedMessageComponent = memo(MessageComponent);

function PureMessages({ messages, isLoading, data }: MessagesProps) {
  const [messagesContainerRef, messagesEndRef] =
    useScrollToBottom<HTMLDivElement>();

  const currentStatus = data?.[data.length - 1];
  const showStatus = isLoading && currentStatus;

  return (
    <div
      ref={messagesContainerRef}
      className="absolute inset-0 flex flex-col overflow-y-auto scroll-smooth"
    >
      <div className="flex flex-col gap-6 px-4 py-4">
        {messages.map((message) => (
          <AnimatePresence key={message.id} mode="wait">
            <MemoizedMessageComponent message={message} />
          </AnimatePresence>
        ))}

        {showStatus && (
          <StatusMessage
            status={currentStatus}
            key={`status-${JSON.stringify(currentStatus)}`}
          />
        )}
      </div>

      <div ref={messagesEndRef} className="h-px w-full" />
    </div>
  );
}

// Optimize memo comparison to only check relevant changes
export const Messages = memo(PureMessages, (prevProps, nextProps) => {
  if (prevProps.isLoading !== nextProps.isLoading) return false;
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
