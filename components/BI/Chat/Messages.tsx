"use client";

import type { Message } from "ai";
import { AnimatePresence, motion } from "framer-motion";
import { AvatarImage, Avatar } from "@/components/ui/avatar";
import { memo } from "react";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { Markdown } from "@/components/Dev/ChatBot/markdown";

interface MessagesProps {
  messages: Message[];
  isLoading?: boolean;
}

function PureMessages({ messages, isLoading }: MessagesProps) {
  const { theme } = useTheme();
  const avatarSrc = theme === "dark" ? "/boticondark.png" : "/boticonlight.png";

  return (
    <div className="absolute inset-0 flex flex-col overflow-y-auto">
      <div className="flex flex-col gap-6 px-4 py-4">
        {messages.map((message) => (
          <AnimatePresence key={message.id}>
            <motion.div
              className={cn(
                "w-full max-w-2xl mx-auto",
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
                    "flex flex-col gap-2",
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
                    <Markdown>{message.content as string}</Markdown>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        ))}

        {isLoading && <ThinkingMessage />}
      </div>
    </div>
  );
}

const ThinkingMessage = () => {
  const { theme } = useTheme();
  const avatarSrc = theme === "dark" ? "/boticondark.png" : "/boticonlight.png";

  return (
    <motion.div
      className="w-full mx-auto max-w-3xl px-4"
      initial={{ y: 5, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      data-role="assistant"
    >
      <div className="flex gap-4">
        <div className="size-8 flex items-center rounded-full justify-center ring-1 shrink-0 ring-border">
          <Avatar className="w-6 h-6">
            <AvatarImage src={avatarSrc} alt="AI" />
          </Avatar>
        </div>
        <div className="flex flex-col gap-2 w-full">
          <div className="text-muted-foreground">Thinking...</div>
        </div>
      </div>
    </motion.div>
  );
};

export const Messages = memo(PureMessages, (prevProps, nextProps) => {
  if (prevProps.isLoading !== nextProps.isLoading) return false;
  if (prevProps.messages.length !== nextProps.messages.length) return false;
  return prevProps.messages.every(
    (msg, i) =>
      msg.id === nextProps.messages[i].id &&
      msg.content === nextProps.messages[i].content
  );
});
