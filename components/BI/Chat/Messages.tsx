"use client";

import { JSONValue, type Message } from "ai";
import { AnimatePresence } from "framer-motion";
import { memo } from "react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { useScrollToBottom } from "@/components/Dev/ChatBot/use-scroll-to-bottom";
import { Message as MessageComponent, Message as MessageType } from "./Message";
import { Avatar } from "@/components/ui/avatar";
import { AvatarImage } from "@radix-ui/react-avatar";
import { motion } from "framer-motion";

interface MessagesProps {
  messages: Message[];
  isLoading?: boolean;
  data?: JSONValue[] | undefined;
}

const statusMessages = {
  processing: "Analyzing your request...",
  generating_query: "Crafting SQL query...",
  executing_query: "Fetching data...",
  generating_visualization: "Creating visualization...",
  completed: "Completed!",
  error: "An error occurred",
};

const StatusMessage = ({ status }: { status: string }) => {
  const { theme } = useTheme();
  const avatarSrc = theme === "dark" ? "/boticondark.png" : "/boticonlight.png";
  const message =
    statusMessages[status as keyof typeof statusMessages] || status;

  return (
    <motion.div
      className="w-full max-w-3xl mx-auto"
      initial={{ y: 5, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      key={status}
    >
      <div className="flex gap-4 items-center">
        <div className="size-8 flex items-center rounded-full justify-center ring-1 shrink-0 ring-border">
          <Avatar className="w-6 h-6">
            <AvatarImage src={avatarSrc} alt="AI" />
          </Avatar>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <div className="h-1 w-1 rounded-full bg-current animate-pulse" />
          {message}
        </div>
      </div>
    </motion.div>
  );
};

function PureMessages({ messages, isLoading, data }: MessagesProps) {
  const [messagesContainerRef, messagesEndRef] =
    useScrollToBottom<HTMLDivElement>();

  const currentStatus = data?.[data.length - 1];
  console.log("Messages:", messages);

  return (
    <div
      ref={messagesContainerRef}
      className="absolute inset-0 flex flex-col overflow-y-auto scroll-smooth"
    >
      <div className="flex flex-col gap-6 px-4 py-4">
        {messages.map((message) => (
          <AnimatePresence key={message.id} mode="wait">
            <MessageComponent message={message} />
          </AnimatePresence>
        ))}

        {isLoading && currentStatus && (
          <StatusMessage
            status={JSON.stringify(currentStatus)}
            key={`status-${JSON.stringify(currentStatus)}`}
          />
        )}
      </div>

      <div ref={messagesEndRef} className="h-px w-full" />
    </div>
  );
}

export const Messages = memo(PureMessages, (prevProps, nextProps) => {
  if (prevProps.isLoading !== nextProps.isLoading) return false;
  if (prevProps.messages.length !== nextProps.messages.length) return false;
  if (JSON.stringify(prevProps.data) !== JSON.stringify(nextProps.data))
    return false;
  return prevProps.messages.every(
    (msg, i) =>
      msg.id === nextProps.messages[i].id &&
      msg.content === nextProps.messages[i].content
  );
});
