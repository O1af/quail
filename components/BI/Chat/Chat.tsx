import { useChat, type Message } from "@ai-sdk/react";
import { cn } from "@/lib/utils";
import { Messages } from "./Messages";
import { Input } from "./Input";
import { useMemo, useCallback, useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ChatSkeleton } from "./ChatSkeleton";
import { Skeleton } from "@/components/ui/skeleton";
import { Welcome } from "./Welcome";
import { useInitializeChat } from "@/lib/hooks/useInitializeChat";
import { loadChat, deleteChat } from "@/components/stores/chat_store";
import { useDatabase } from "@/lib/hooks/use-database";
import { useSpeedMode } from "@/components/stores/table_store";
import { useDatabaseStructure } from "@/lib/hooks/use-table-data";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ChatResponse } from "@/lib/types/stores/chat";

interface ChatProps {
  className?: string;
  chat_id?: string;
}

// Function to fetch chat data, used by React Query
async function fetchChatData(chatId?: string): Promise<ChatResponse | null> {
  if (!chatId) return null;

  const supabase = createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("User not authenticated");
  }

  return loadChat(chatId, user.id);
}

export default function Chat({ className, chat_id }: ChatProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { error: initError, localId, isLoadingId } = useInitializeChat(chat_id);
  const [noDatabaseSelected, setNoDatabaseSelected] = useState(false);
  const [currentTitle, setCurrentTitle] = useState("New Chat");

  // Fetch chat data using React Query, enabled only when localId is available
  const {
    data: chatData,
    isLoading: isChatLoading,
    error: chatError,
    isFetching: isChatFetching, // Use isFetching to show loading during background updates
  } = useQuery<ChatResponse | null, Error>({
    queryKey: ["chat", localId], // Query key includes the chat ID
    queryFn: () => fetchChatData(localId),
    enabled: !!localId, // Only run the query if localId is truthy
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false, // Avoid refetching just on focus, rely on invalidation
    refetchOnMount: true, // Refetch when component mounts if stale
  });

  // Update local title state when chat data loads or changes
  useEffect(() => {
    if (chatData && chatData.title !== "New Chat") {
      setCurrentTitle(chatData.title);
    } else if (!localId) {
      // Reset title for a new chat scenario
      setCurrentTitle("New Chat");
    }
    // Reset title if navigating to /chat (no id)
    if (!chat_id && !isLoadingId) {
      setCurrentTitle("New Chat");
    }
  }, [chatData, localId, chat_id, isLoadingId]);

  // Get current database info
  const { getCurrentDatabase } = useDatabase();
  const currentDB = getCurrentDatabase();
  const { data: databaseStructure = { schemas: [] } } = useDatabaseStructure();
  const speedMode = useSpeedMode();

  // Check if database is selected
  useEffect(() => {
    setNoDatabaseSelected(!currentDB);
  }, [currentDB]);

  // Memoize request preparation
  const prepareRequestBody = useCallback(
    (body: any) => {
      if (!currentDB) {
        // This should ideally be caught earlier, but keep as a safeguard
        setNoDatabaseSelected(true);
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
    isLoading: isAiLoading, // Loading state from the AI SDK
  } = useChat({
    api: "/api/biChat",
    id: localId, // Use the dynamic localId
    // Use initialMessages from query data, only when not loading and data exists
    initialMessages: chatData?.messages ?? [],
    sendExtraMessageFields: true,
    experimental_prepareRequestBody: prepareRequestBody,
    onFinish: async () => {
      setData(undefined); // Reset status data

      // Invalidate the specific chat query to refetch potentially updated title
      if (localId) {
        await queryClient.invalidateQueries({ queryKey: ["chat", localId] });
        // Also invalidate the list to update timestamp/title potentially
        await queryClient.invalidateQueries({ queryKey: ["chats"] });
      }
    },
    // Clear messages if navigating to a new chat ID or /chat
    // Note: useChat doesn't directly support clearing messages on ID change.
    // We rely on the component re-mounting or initialMessages changing.
  });

  // Effect to clear messages when navigating to /chat (no ID)
  useEffect(() => {
    if (!chat_id && !isLoadingId) {
      setMessages([]);
    }
  }, [chat_id, isLoadingId, setMessages]);

  // Optimized submit handler - adjust type to match useChat expectation
  const handleSubmit = useCallback(
    (
      event?:
        | React.FormEvent<HTMLFormElement>
        | { preventDefault?: () => void }, // Allow FormEvent or the simpler object structure
      options?: any | undefined // Use 'any' as ChatRequestOptions is not exported
    ) => {
      if (noDatabaseSelected) {
        console.warn("Submission prevented: No database selected.");
        return;
      }
      setData(undefined);
      // Pass options through if provided
      originalHandleSubmit(event as any, options); // Use 'as any' for simplicity
    },
    [originalHandleSubmit, setData, noDatabaseSelected]
  );

  // Memoized delete handler (kept for potential future use, though delete is in sidebar)
  const handleDelete = useCallback(async () => {
    if (!localId) return;
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Unauthorized");

      // Use the deleteChat store function directly
      await deleteChat(localId, user.id);

      // Invalidate queries after successful deletion
      await queryClient.invalidateQueries({ queryKey: ["chats"] });
      await queryClient.invalidateQueries({ queryKey: ["chat", localId] }); // Remove specific chat data

      router.push("/chat", { scroll: false }); // Redirect to new chat page
    } catch (err) {
      console.error("Failed to delete chat:", err);
      // TODO: Show error notification
    }
  }, [localId, router, queryClient]);

  // Determine overall loading state
  const isLoading = isLoadingId || (!!localId && isChatLoading);

  // Check if we should show welcome screen
  const showWelcome = useMemo(
    () =>
      !localId || (!isLoading && !messages.length && !input && !isAiLoading),
    [localId, isLoading, messages.length, input, isAiLoading]
  );

  // Handle initialization or query errors
  const combinedError = initError || chatError?.message;
  if (combinedError) {
    return (
      <div className="flex items-center justify-center h-full text-red-500 p-4">
        Error: {combinedError}
      </div>
    );
  }

  // Show loading skeleton
  if (isLoading) {
    return (
      <div className={cn("flex flex-col h-full", className)}>
        <div className="px-4 py-2 border-b flex justify-between items-center">
          <Skeleton className="h-6 w-32" />
        </div>
        <div className="flex-1 px-4 py-4 overflow-hidden">
          <ChatSkeleton />
        </div>
        <div className="px-4 py-2 border-t">
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    );
  }

  // Show "No Database" warning if applicable
  if (noDatabaseSelected) {
    return (
      <div className={cn("flex flex-col h-full", className)}>
        <Alert variant="destructive" className="m-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No database selected. Please select a database from the settings.
          </AlertDescription>
        </Alert>
        {/* Optionally show Welcome or restrict further interaction */}
        <div className="flex-1">
          {/* Removed onExampleClick prop */}
          <Welcome />
        </div>
        <Input // Still show input but maybe disable it or handle submission differently
          input={input}
          setInput={setInput}
          status={status}
          stop={stop}
          messages={messages}
          setMessages={setMessages}
          append={append}
          handleSubmit={handleSubmit} // Pass the correctly typed handler
          className="border-t bg-background/95 backdrop-blur-sm supports-backdrop-filter:bg-background/75"
          // Removed disabled prop
        />
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col h-full", className)}>
      <div className="flex-1 overflow-hidden">
        {showWelcome ? (
          // Removed onExampleClick prop
          <Welcome />
        ) : (
          <div className="h-full relative">
            {/* Removed isLoading prop */}
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
        handleSubmit={handleSubmit} // Pass the correctly typed handler
        className="border-t bg-background/95 backdrop-blur-sm supports-backdrop-filter:bg-background/75"
        // Removed disabled prop
      />
    </div>
  );
}
