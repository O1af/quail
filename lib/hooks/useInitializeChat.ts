import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Message } from "ai/react";
import { createClient } from "@/utils/supabase/client";
import { loadChat } from "@/components/stores/chat_store";

export function useInitializeChat(id?: string) {
  const [error, setError] = useState<string | null>(null);
  const [localId, setLocalId] = useState<string>(id || "");
  const [initialMessages, setInitialMessages] = useState<Message[]>([]);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [title, setTitle] = useState<string>("New Chat");
  const router = useRouter();

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
        if (chatTitle !== "New Chat") {
          setTitle(chatTitle);
        }
      } catch (err) {
        console.error("Failed to load chat:", err);
      } finally {
        setIsInitialLoad(false);
      }
    }
    fetchChat();
  }, [id, isInitialLoad]);

  return {
    error,
    localId,
    initialMessages,
    isInitialLoad,
    title,
    setTitle,
  };
}
