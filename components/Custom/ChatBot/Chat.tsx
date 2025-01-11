"use client";

import { useChat } from "ai/react";
import { Messages } from "./Messages";
import ExampleMessages from "./example-messages";
import { MultimodalInput } from "./multimodal-input";
import { useDatabaseStructure } from "@/components/stores/table_store";
import { useEffect } from "react";
import { useDbStore } from "@/components/stores/db_store";
import { useState } from "react";
import { generateChartConfig } from "@/app/app/api/chat/actions";

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
        }),
      );
    },
  });

  const { isDatabaseChanged, resetDatabaseChange } = useDbStore();
  //const [userQuery, setUserQuery] = useState("");

  useEffect(() => {
    if (isDatabaseChanged) {
      setMessages([]);
      resetDatabaseChange();
    }
  }, [isDatabaseChanged, setMessages, resetDatabaseChange]);

  //const handleChartConfigGeneration = async (e: React.FormEvent) => {
  //  e.preventDefault();
  //
  //  try {
  //    console.log(databaseStructure);
  //    console.log("Current DB:", databaseStructure);
  //
  //    const response = await generateChartConfig(databaseStructure, userQuery);
  //
  //    const responseColumns =
  //      response.results.length > 0 ? Object.keys(response.results[0]) : [];
  //
  //    setColumns(responseColumns);
  //
  //    setChartConfig(response.config);
  //    setResults(response.results);
  //    console.log("Generated Chart Config:", chartConfig);
  //    console.log(results);
  //  } catch (error) {
  //    console.error("Error generating chart config:", error);
  //  }
  //};

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
      {
        //  <form
        //    onSubmit={handleChartConfigGeneration}
        //    className="flex flex-col mx-auto mt-4 w-full md:max-w-3xl px-4"
        //  >
        //    <label htmlFor="userQuery" className="text-sm text-gray-600">
        //      Enter your query for chart generation:
        //    </label>
        //    <input
        //      id="userQuery"
        //      type="text"
        //      value={userQuery}
        //      onChange={(e) => setUserQuery(e.target.value)}
        //      className="border border-gray-300 rounded p-2 mt-2"
        //      placeholder="E.g., Show sales trends by month"
        //    />
        //    <button
        //      type="submit"
        //      className="mt-4 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
        //    >
        //      Generate Chart Config
        //    </button>
        //  </form>
      }
    </div>
  );
}
