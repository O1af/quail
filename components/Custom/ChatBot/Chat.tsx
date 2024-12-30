"use client";

import { useChat } from "ai/react";
import { Messages } from "./Messages";
import ExampleMessages from "./example-messages";
import { MultimodalInput } from "./multimodal-input";

export default function Chat() {
  const {
    messages,
    setMessages,
    input,
    setInput,
    append,
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
    <div className="flex flex-col min-w-0 h-[95dvh] bg-background">
      {messages.length === 0 ? (
        <ExampleMessages handleInputChange={handleInputChange} />
      ) : (
        <Messages isLoading={isLoading} messages={messages} reload={reload} />
      )}

      <form className="flex mx-auto px-4 bg-background pb-4 md:pb-6 gap-2 w-full md:max-w-3xl">
        <MultimodalInput
          input={input}
          setInput={setInput}
          handleSubmit={handleSubmit}
          isLoading={isLoading}
          stop={stop}
          messages={messages}
          setMessages={setMessages}
          append={append}
        />
      </form>
    </div>
  );
}
