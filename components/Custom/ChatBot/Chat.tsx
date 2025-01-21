"use client";

import { useChat } from "ai/react";
import { Messages } from "./Messages";
import ExampleMessages from "./example-messages";
import { MultimodalInput } from "./multimodal-input";
import { useDatabaseStructure } from "@/components/stores/table_store";
import { useEffect } from "react";
import { useDbStore } from "@/components/stores/db_store";

export const maxDuration = 30;

export default function Chat() {
  const databaseStructure = useDatabaseStructure();
  const { getCurrentDatabase } = useDbStore();

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
      const currentDb = getCurrentDatabase();
      return JSON.parse(
        JSON.stringify({
          messages,
          databaseStructure,
          dbType: currentDb?.type || "postgres", // default to postgres if no db selected
          connectionString: currentDb?.connectionString,
        }),
      );
    },
  });

  const { isDatabaseChanged, resetDatabaseChange } = useDbStore();

  useEffect(() => {
    if (isDatabaseChanged) {
      setMessages([]);
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
