import { Message } from "ai";
import { cn } from "@/lib/utils";

interface MessagesProps {
  messages: Message[];
  className?: string;
}

export function Messages({ messages, className }: MessagesProps) {
  return (
    <div className={cn("space-y-4 overflow-y-auto", className)}>
      {messages.map((message) => (
        <div
          key={message.id}
          className={cn(
            "flex items-start gap-4 p-4 rounded-lg",
            message.role === "assistant" ? "bg-muted" : "bg-primary/10"
          )}
        >
          <div className="font-semibold">
            {message.role === "assistant" ? "AI" : "You"}:
          </div>
          <div className="flex-1">{message.content}</div>
        </div>
      ))}
    </div>
  );
}
