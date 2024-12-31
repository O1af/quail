"use client";

import type { ChatRequestOptions, Message } from "ai";
import cx from "classnames";
import { AnimatePresence, motion } from "framer-motion";
import { AvatarImage, Avatar } from "@/components/ui/avatar";
import { memo, useState } from "react";

import { Markdown } from "./markdown";
import { MessageActions } from "./message-actions";
import equal from "fast-deep-equal";
import { cn } from "@/lib/utils";

import { useTheme } from "next-themes";

const PurePreviewMessage = ({
  message,
  isLoading,
}: {
  message: Message;
  isLoading: boolean;
  reload: (
    chatRequestOptions?: ChatRequestOptions,
  ) => Promise<string | null | undefined>;
}) => {
  const [mode, setMode] = useState<"view" | "edit">("view");

  const { theme } = useTheme();
  const avatarSrc = theme === "dark" ? "/BotIconDark.png" : "/BotIconLight.png";

  return (
    <AnimatePresence>
      <motion.div
        className="w-full mx-auto max-w-3xl px-4 group/message"
        initial={{ y: 5, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        data-role={message.role}
      >
        <div
          className={cn(
            "flex gap-4 w-full group-data-[role=user]/message:ml-auto group-data-[role=user]/message:max-w-2xl",
            {
              "w-full": mode === "edit",
              "group-data-[role=user]/message:w-fit": mode !== "edit",
            },
          )}
        >
          {message.role === "assistant" && (
            <div className="size-8 flex items-center rounded-full justify-center ring-1 shrink-0 ring-border bg-background">
              <div className="translate-y-px">
                <Avatar className="w-8 h-">
                  <AvatarImage src={avatarSrc} alt="QuailAI" />
                </Avatar>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2 w-full">
            {message.content && mode === "view" && (
              <div className="flex flex-row gap-2 items-start">
                <div
                  className={cn("flex flex-col gap-4", {
                    "text-sm bg-primary text-primary-foreground p-2 rounded-xl":
                      message.role === "user",
                    "text-sm": message.role === "assistant",
                  })}
                >
                  <Markdown>{message.content as string}</Markdown>
                </div>
              </div>
            )}

            {
              <MessageActions
                key={`action-${message.id}`}
                message={message}
                isLoading={isLoading}
              />
            }
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export const PreviewMessage = memo(
  PurePreviewMessage,
  (prevProps, nextProps) => {
    if (prevProps.isLoading !== nextProps.isLoading) return false;
    if (prevProps.message.content !== nextProps.message.content) return false;
    if (
      !equal(
        prevProps.message.toolInvocations,
        nextProps.message.toolInvocations,
      )
    )
      return false;

    return true;
  },
);

export const ThinkingMessage = () => {
  const role = "assistant";
  const { theme } = useTheme();
  const avatarSrc = theme === "dark" ? "/BotIconDark.png" : "/BotIconLight.png";

  return (
    <motion.div
      className="w-full mx-auto max-w-3xl px-4 group/message "
      initial={{ y: 5, opacity: 0 }}
      animate={{ y: 0, opacity: 1, transition: { delay: 1 } }}
      data-role={role}
    >
      <div
        className={cx(
          "flex gap-4 group-data-[role=user]/message:px-3 w-full group-data-[role=user]/message:w-fit group-data-[role=user]/message:ml-auto group-data-[role=user]/message:max-w-2xl group-data-[role=user]/message:py-2 rounded-xl",
          {
            "group-data-[role=user]/message:bg-muted": true,
          },
        )}
      >
        <div className="size-8 flex items-center rounded-full justify-center ring-1 shrink-0 ring-border">
          <Avatar className="w-6 h-6">
            <AvatarImage src={avatarSrc} alt="QuailAI" />
          </Avatar>
        </div>

        <div className="flex flex-col gap-2 w-full">
          <div className="flex flex-col gap-4 text-muted-foreground">
            Thinking...
          </div>
        </div>
      </div>
    </motion.div>
  );
};
