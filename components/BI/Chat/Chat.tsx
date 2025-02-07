import { useChat } from "ai/react";
import { cn } from "@/lib/utils";
import { Messages } from "./Messages";
import { Input } from "./Input";

export default function Chat({ className }: { className?: string }) {
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: "/api/biChat",
  });

  return (
    <div className={cn("flex flex-col h-full", className)}>
      <Messages messages={messages} className="flex-1 px-4 py-4" />
      <Input
        input={input}
        handleInputChange={handleInputChange}
        handleSubmit={handleSubmit}
        className="px-4 py-2 border-t"
      />
    </div>
  );
}
