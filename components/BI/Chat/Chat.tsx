import { useChat } from "ai/react";
import { cn } from "@/lib/utils";
import { Messages } from "./Messages";
import { Input } from "./Input";
import { useEffect, useState, useMemo } from "react";
import { loadChat } from "@/components/stores/chat_store";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { Message } from "ai/react";

interface ChatProps {
  className?: string;
  id?: string;
}

export default function Chat({ className, id }: ChatProps) {
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const [localId, setLocalId] = useState<string | undefined>(id);
  const [initialMessages, setInitialMessages] = useState<Message[]>([]);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit: originalHandleSubmit,
    isLoading: isChatLoading,
    setMessages,
  } = useChat({
    api: "/api/biChat",
    id: localId || "new",
    initialMessages,
    sendExtraMessageFields: true,
    onResponse: (response) => {
      const chatId = response.headers.get("X-Chat-Id");
      if (chatId && (!localId || localId === "new")) {
        setLocalId(chatId);
        router.replace(`/chat/${chatId}`, {
          scroll: false,
        });
      }
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    originalHandleSubmit(e);
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
        const { messages: chatMessages } = await loadChat(id, user.user.id);
        setInitialMessages(chatMessages);
        setMessages(chatMessages);
      } catch (err) {
        setError("Failed to load chat");
      } finally {
        setIsInitialLoad(false);
      }
    }
    fetchChat();
  }, [id, setMessages, isInitialLoad]);

  const memoizedMessages = useMemo(() => messages, [messages]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-full text-red-500">
        {error}
      </div>
    );
  }

  if (!id && !localId) {
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
          handleInputChange={handleInputChange}
          handleSubmit={handleSubmit}
          className="px-4 py-2 border-t"
          disabled={isChatLoading}
        />
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col h-full", className)}>
      <Messages messages={memoizedMessages} className="flex-1 px-4 py-4" />
      <Input
        input={input}
        handleInputChange={handleInputChange}
        handleSubmit={handleSubmit}
        className="px-4 py-2 border-t"
        disabled={isChatLoading}
      />
    </div>
  );
}
