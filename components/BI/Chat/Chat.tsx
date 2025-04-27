import { useChat } from "@ai-sdk/react";
import { cn } from "@/lib/utils";
import { Messages } from "./Messages";
import { Input } from "./Input";
import { useMemo, useCallback, useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { ChatSkeleton } from "./ChatSkeleton";
import { Skeleton } from "@/components/ui/skeleton";
import { Welcome } from "./Welcome";
import { useInitializeChat } from "@/lib/hooks/useInitializeChat";
import { loadChat } from "@/components/stores/chat_store";
import { useDatabase } from "@/lib/hooks/use-database";
import { useSpeedMode } from "@/components/stores/table_store";
import { useDatabaseStructure } from "@/lib/hooks/use-table-data";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ChatProps {
  className?: string;
  chat_id?: string;
}

export default function Chat({ className, chat_id }: ChatProps) {
  const router = useRouter();
  const { error, localId, initialMessages, isInitialLoad, title, setTitle } =
    useInitializeChat(chat_id);
  const [noDatabaseSelected, setNoDatabaseSelected] = useState(false);

  useEffect(() => {
    if (localId) {
      const supabase = createClient();
    }
  }, [localId, setTitle]);

  // Get current database info
  const { getCurrentDatabase } = useDatabase();
  const currentDB = getCurrentDatabase();
  const { data: databaseStructure = { schemas: [] } } = useDatabaseStructure();
  const speedMode = useSpeedMode();

  // Check if database is selected
  useEffect(() => {
    setNoDatabaseSelected(!currentDB);
  }, [currentDB]);

  // Memoize request preparation to prevent unnecessary re-creation
  const prepareRequestBody = useCallback(
    (body: any) => {
      if (!currentDB) {
        throw new Error(
          "No database selected. Please select a database from the settings."
        );
      }
      return {
        ...body,
        dbType: currentDB.type,
        connectionString: currentDB.connectionString,
        databaseStructure,
        speedMode,
      };
    },
    [currentDB, databaseStructure, speedMode]
  );

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit: originalHandleSubmit,
    status,
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
    experimental_prepareRequestBody: prepareRequestBody,
    onFinish: async (message) => {
      // Reset the status data when finished
      setData(undefined);

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

  // Optimized submit handler
  const handleSubmit = useCallback(
    (event?: { preventDefault?: () => void }) => {
      setData(undefined);
      originalHandleSubmit(event);
    },
    [originalHandleSubmit, setData]
  );

  // Memoized delete handler
  const handleDelete = useCallback(async () => {
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
  }, [localId, router]);

  // Check if we should show welcome screen
  const showWelcome = useMemo(
    () => (!messages.length && title === "New Chat") || (!chat_id && !localId),
    [messages.length, title, chat_id, localId]
  );

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

  if (noDatabaseSelected) {
    return (
      <div className={cn("flex flex-col h-full", className)}>
        <Alert variant="destructive" className="m-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No database selected. Please select a database from the settings.
          </AlertDescription>
        </Alert>
        <div className="flex-1">
          <Welcome />
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col h-full", className)}>
      <div className="flex-1 overflow-hidden">
        {showWelcome ? (
          <Welcome />
        ) : (
          <div className="h-full relative">
            <Messages messages={messages} status={status} data={data} />
          </div>
        )}
      </div>

      <Input
        input={input}
        setInput={setInput}
        status={status}
        stop={stop}
        messages={messages}
        setMessages={setMessages}
        append={append}
        handleSubmit={handleSubmit}
        className="border-t bg-background/95 backdrop-blur-sm supports-backdrop-filter:bg-background/75"
      />
    </div>
  );
}
