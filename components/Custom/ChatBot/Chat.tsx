"use client";

import { useChat } from "ai/react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Messages } from "./messages";
import ExampleMessages from "./ExampleMessages";
import { Input } from "./Input";

export default function Chat() {
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    stop,
    reload,
  } = useChat();

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex flex-col items-center w-full h-full bg-background p-4">
      <ScrollArea className="h-[700px] w-full">
        {messages.length === 0 ? (
          <ExampleMessages handleInputChange={handleInputChange} />
        ) : (
          <Messages isLoading={isLoading} messages={messages} reload={reload} />
        )}
      </ScrollArea>

      <Input
        input={input}
        handleInputChange={handleInputChange}
        handleSubmit={handleSubmit}
        handleKeyDown={handleKeyDown}
        isLoading={isLoading}
        stop={stop}
      />
    </div>
  );
}
