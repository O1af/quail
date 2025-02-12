import { useChat } from "ai/react";
import { cn } from "@/lib/utils";
import { Messages } from "./Messages";
import { Input } from "./Input";
import { useEffect, useState, useMemo } from "react";
import { loadChat } from "@/components/stores/chat_store";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { Message } from "ai/react";
import { ChatSkeleton } from "./ChatSkeleton";
import { Skeleton } from "@/components/ui/skeleton";

interface ChatProps {
  className?: string;
  id?: string;
}

export default function Chat({ className, id }: ChatProps) {
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const [localId, setLocalId] = useState<string>(id || "");
  const [initialMessages, setInitialMessages] = useState<Message[]>([]);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [title, setTitle] = useState<string>("New Chat");

  useEffect(() => {
    async function initChat() {
      if (!id && !localId) {
        try {
          const response = await fetch("/api/biChat/id");
          const data = await response.json();
          if (data.id) {
            setLocalId(data.id);
            router.push(`/chat/${data.id}`, { scroll: false });
          }
        } catch (err) {
          setError("Failed to initialize chat");
        }
      }
    }
    initChat();
  }, [id, localId, router]);

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
  } = useChat({
    api: "/api/biChat",
    id: localId,
    initialMessages,
    sendExtraMessageFields: true,
    onFinish: async () => {
      if (localId) {
        const supabase = await createClient();
        const { data: user } = await supabase.auth.getUser();
        if (user.user) {
          const chat = await loadChat(localId, user.user.id);
          setTitle(chat.title);
          // Trigger chat list refresh
          window.dispatchEvent(new Event("chatUpdated"));
        }
      }
    },
  });

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

  useEffect(() => {
    async function fetchChat() {
      if (!id || !isInitialLoad) return;

      const supabase = await createClient();
      const { data: user, error: err } = await supabase.auth.getUser();

      if (err || !user) {
        setError("Unauthorized");
        return;
      }

      try {
        const { messages: chatMessages, title: chatTitle } = await loadChat(
          id,
          user.user.id
        );
        setInitialMessages(chatMessages);
        setMessages(chatMessages);
        if (chatTitle !== "New Chat") {
          setTitle(chatTitle);
        }
      } catch (err) {
        console.error("Failed to load chat:", err);
        // Don't set error for new chats
      } finally {
        setIsInitialLoad(false);
      }
    }
    fetchChat();
  }, [id, setMessages, isInitialLoad]);

  const memoizedMessages = useMemo(
    () => messages?.filter((m) => m.content?.trim()),
    [messages]
  );

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

  if (!memoizedMessages?.length && !id && !localId) {
    return (
      <div className={cn("flex flex-col h-full", className)}>
        <div className="flex-1 flex items-center justify-center text-center p-4">
          <div className="max-w-md space-y-2">
            <h2 className="text-2xl font-semibold">Welcome to Chat</h2>
            <p className="text-muted-foreground">
              Start typing below to begin a new conversation.
            </p>
          </div>
        </div>
        <Input
          input={input}
          setInput={setInput}
          isLoading={isChatLoading}
          stop={stop}
          messages={messages}
          setMessages={setMessages}
          append={append}
          handleSubmit={originalHandleSubmit}
          className="px-4 py-2 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/75"
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col h-full bg-gradient-to-b from-background to-muted/50",
        className
      )}
    >
      <div className="flex-1 overflow-hidden">
        {showWelcome ? (
          <div className="flex-1 flex items-center justify-center text-center p-4">
            <div className="max-w-md space-y-2">
              <h2 className="text-2xl font-semibold">Welcome to Chat</h2>
              <p className="text-muted-foreground">
                Start typing below to begin a new conversation.
              </p>
            </div>
          </div>
        ) : (
          <div className="h-full relative">
            <Messages messages={memoizedMessages} isLoading={isChatLoading} />
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
        handleSubmit={originalHandleSubmit}
        className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/75"
      />
    </div>
  );
}
