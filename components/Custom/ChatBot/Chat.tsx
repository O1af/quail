"use client";

import { useChat } from "ai/react";
import { Messages } from "./Messages";
import ExampleMessages from "./example-messages";
import { MultimodalInput } from "./multimodal-input";
import { useDatabaseStructure } from "@/components/stores/table_store";
import { useEffect } from "react";
import { useDbStore } from "@/components/stores/db_store";

export default function Chat() {
  const databaseStructure = useDatabaseStructure();

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
  } = useChat({
    experimental_prepareRequestBody: ({ messages }) => {
      // Return a modified body with both the messages and the databaseStructure
      return {
        messages,
        databaseStructure, // Add the database structure here
      };
    },
  });

  const { isDatabaseChanged, resetDatabaseChange } = useDbStore();

  useEffect(() => {
    if (isDatabaseChanged) {
      // Clear messages when the database is updated
      setMessages([]);
      // Reset the database update flag to false
      resetDatabaseChange();
    }
  }, [isDatabaseChanged, setMessages, resetDatabaseChange]);

  return (
    <div className="flex flex-col min-w-0 h-[91dvh] bg-background">
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
