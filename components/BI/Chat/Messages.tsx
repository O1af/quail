import { Message } from "ai";
import { cn } from "@/lib/utils";
import { memo } from "react";

interface MessagesProps {
  messages: Message[];
  className?: string;
}

export const Messages = memo(
  function Messages({ messages, className }: MessagesProps) {
    return (
      <div className={cn("space-y-4 overflow-y-auto", className)}>
        {messages?.map((message) => (
          <div
            key={message.id || `${message.role}-${message.content}`}
            className={cn(
              "flex items-start gap-4 p-4 rounded-lg",
              message.role === "assistant" ? "bg-muted" : "bg-primary/10"
            )}
          >
            <div className="font-semibold">
              {message.role === "assistant" ? "AI" : "You"}:
            </div>
            <div className="flex-1 whitespace-pre-wrap">{message.content}</div>
          </div>
        ))}
      </div>
    );
  },
  (prevProps, nextProps) => {
    if (!prevProps.messages || !nextProps.messages) return false;
    if (prevProps.messages.length !== nextProps.messages.length) return false;
    return prevProps.messages.every(
      (msg, i) =>
        msg.content === nextProps.messages[i].content &&
        msg.role === nextProps.messages[i].role
    );
  }
);
