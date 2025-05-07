"use client";

import type { ChatRequestOptions, Message } from "ai";
import cx from "classnames";
import { AnimatePresence, motion } from "framer-motion";
import { AvatarImage, Avatar } from "@/components/ui/avatar";
import { memo, useState } from "react";
import { useTheme } from "next-themes";

import { Markdown } from "./markdown";
import { MessageActions } from "./message-actions";
import { cn } from "@/lib/utils";

const PurePreviewMessage = ({
  message,
  isLoading,
  reload,
}: {
  message: Message;
  isLoading: boolean;
  reload: (
    chatRequestOptions?: ChatRequestOptions
  ) => Promise<string | null | undefined>;
}) => {
  const [mode, setMode] = useState<"view" | "edit">("view");
  const { resolvedTheme } = useTheme();

  return (
    <AnimatePresence>
      <motion.div
        className="w-full mx-auto max-w-3xl px-4 group/message"
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1, transition: { duration: 0.3 } }}
        data-role={message.role}
      >
        <div
          className={cn(
            "flex gap-4 w-full group-data-[role=user]/message:ml-auto group-data-[role=user]/message:max-w-2xl",
            {
              "w-full": mode === "edit",
              "group-data-[role=user]/message:w-fit": mode !== "edit",
            }
          )}
        >
          {message.role === "assistant" && (
            <div className="size-12 flex items-center rounded-full justify-center shrink-0 bg-background shadow-sm">
              <div className="translate-y-px">
                <Avatar className="w-12 h-12">
                  <AvatarImage
                    src="/quail_logo.svg"
                    alt="QuailAI"
                    className={
                      resolvedTheme === "dark" ? "brightness-0 invert" : ""
                    }
                  />
                </Avatar>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2 w-full min-w-0">
            {" "}
            {/* Added min-w-0 */}
            {message.content && mode === "view" && (
              <div className="flex flex-row gap-2 items-start">
                <div
                  className={cn(
                    "flex flex-col gap-4 rounded-2xl", // Removed break-words from here
                    {
                      "text-sm bg-primary text-primary-foreground p-3 shadow-sm":
                        message.role === "user",
                      "text-sm": message.role === "assistant",
                    }
                  )}
                >
                  <Markdown>{message.content as string}</Markdown>
                </div>
              </div>
            )}
            {message.role === "assistant" && (
              <MessageActions
                key={`action-${message.id}`}
                message={message}
                isLoading={isLoading}
              />
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export const PreviewMessage = memo(
  PurePreviewMessage,
  (prevProps, nextProps) =>
    prevProps.isLoading === nextProps.isLoading &&
    prevProps.message.id === nextProps.message.id &&
    prevProps.message.content === nextProps.message.content
);

export const ThinkingMessage = () => {
  const role = "assistant";
  const { resolvedTheme } = useTheme();

  return (
    <motion.div
      className="w-full mx-auto max-w-3xl px-4 group/message"
      initial={{ y: 10, opacity: 0 }}
      animate={{
        y: 0,
        opacity: 1,
        transition: { delay: 0.5, duration: 0.3 },
      }}
      data-role={role}
    >
      <div className="flex gap-4 w-full">
        <div className="size-12 flex items-center rounded-full justify-center shrink-0 bg-background shadow-sm">
          <Avatar className="w-12 h-12">
            <AvatarImage
              src="/quail_logo.svg"
              alt="QuailAI"
              className={resolvedTheme === "dark" ? "brightness-0 invert" : ""}
            />
          </Avatar>
        </div>

        <div className="flex items-center">
          <div className="flex items-center text-muted-foreground gap-1">
            <span>Thinking</span>
            <motion.span
              initial={{ opacity: 0 }}
              animate={{
                opacity: [0, 1, 0],
                transition: { repeat: Infinity, duration: 1.5 },
              }}
            >
              .
            </motion.span>
            <motion.span
              initial={{ opacity: 0 }}
              animate={{
                opacity: [0, 1, 0],
                transition: {
                  repeat: Infinity,
                  duration: 1.5,
                  delay: 0.5,
                },
              }}
            >
              .
            </motion.span>
            <motion.span
              initial={{ opacity: 0 }}
              animate={{
                opacity: [0, 1, 0],
                transition: {
                  repeat: Infinity,
                  duration: 1.5,
                  delay: 1,
                },
              }}
            >
              .
            </motion.span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
