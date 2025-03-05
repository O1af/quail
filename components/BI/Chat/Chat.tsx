import { useChat } from "@ai-sdk/react";
import { cn } from "@/lib/utils";
import { Messages } from "./Messages";
import { Input } from "./Input";
import { useMemo } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { ChatSkeleton } from "./ChatSkeleton";
import { Skeleton } from "@/components/ui/skeleton";
import { Welcome } from "./Welcome";
import { useInitializeChat } from "@/hooks/useInitializeChat";
import { loadChat } from "@/components/stores/chat_store";
import { useDbStore } from "@/components/stores/db_store";
import { optimizeMessages } from "@/app/app/api/biChat/utils/format";
import { useDatabaseStructure } from "@/components/stores/table_store";

interface ChatProps {
  className?: string;
  id?: string;
}

export default function Chat({ className, id }: ChatProps) {
  const router = useRouter();
  const { error, localId, initialMessages, isInitialLoad, title, setTitle } =
    useInitializeChat(id);

  // Move hooks to component level
  const currentDB = useDbStore().getCurrentDatabase();
  const databaseStructure = useDatabaseStructure();

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit: originalHandleSubmit,
    isLoading: isChatLoading,
    setMessages,
    setInput,
    stop,
    append,
    data,
    setData,
  } = useChat({
    api: "/api/biChat",
    id: localId,
    initialMessages,
    sendExtraMessageFields: true,
    experimental_prepareRequestBody: (body) => ({
      ...body,
      messages: optimizeMessages(body.messages),
      dbType: currentDB?.type || "postgres",
      connectionString: currentDB?.connectionString,
      databaseStructure,
    }),
    onResponse: (response) => {
      console.log("Chat: Received response", response);
    },
    onFinish: async (message) => {
      console.log("Chat: Finished message", message);
      if (localId) {
        const supabase = await createClient();
        const { data: user } = await supabase.auth.getUser();
        if (user.user) {
          const chat = await loadChat(localId, user.user.id);
          setTitle(chat.title);
          window.dispatchEvent(new Event("chatUpdated"));
        }
      }
    },
  });

  const handleSubmit = (event?: { preventDefault?: () => void }) => {
    setData(undefined);
    originalHandleSubmit(event);
  };

  const handleDelete = async () => {
    if (!localId || localId === "new") return;
    try {
      const response = await fetch(`/api/biChat?id=${localId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        router.push("/chat", { scroll: false });
      }
    } catch (err) {
      console.error("Failed to delete chat:", err);
    }
  };

  const memoizedMessages = useMemo(() => messages, [messages, data]);

  const showWelcome =
    (!memoizedMessages?.length && title === "New Chat") || (!id && !localId);

  if (error) {
    return (
      <div className="flex items-center justify-center h-full text-red-500">
        {error}
      </div>
    );
  }

  if (isInitialLoad) {
    return (
      <div className={cn("flex flex-col h-full", className)}>
        <div className="px-4 py-2 border-b flex justify-between items-center">
          <Skeleton className="h-6 w-32" />
        </div>
        <div className="flex-1 px-4 py-4">
          <ChatSkeleton />
        </div>
        <div className="px-4 py-2 border-t">
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col h-full", // removed bg-gradient-to-b from-background to-muted/50
        className
      )}
    >
      <div className="flex-1 overflow-hidden">
        {showWelcome ? (
          <Welcome />
        ) : (
          <div className="h-full relative">
            <Messages
              messages={memoizedMessages}
              isLoading={isChatLoading}
              data={data}
            />
          </div>
        )}
      </div>

      <Input
        input={input}
        setInput={setInput}
        isLoading={isChatLoading}
        stop={stop}
        messages={messages}
        setMessages={setMessages}
        append={append}
        handleSubmit={handleSubmit}
        className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/75"
      />
    </div>
  );
}
