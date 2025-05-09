import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface UseInitializeChatResult {
  error: string | null;
  localId: string | undefined;
  isLoadingId: boolean;
}

/**
 * Hook to ensure a chat ID exists.
 * If no `id` is provided via props, it fetches a new ID from the API
 * and redirects the user to the new chat URL.
 *
 * @param id Optional chat ID from props/URL.
 * @returns Object with chat ID, loading state, and any error.
 */
export function useInitializeChat(id?: string): UseInitializeChatResult {
  const [error, setError] = useState<string | null>(null);
  const [localId, setLocalId] = useState<string | undefined>(id);
  const [isLoading, setIsLoading] = useState(Boolean(!id));
  const router = useRouter();

  useEffect(() => {
    // If we already have an ID (either from props or previously fetched), do nothing
    if (localId || !isLoading) return;

    let isMounted = true;

    async function fetchChatId() {
      try {
        const response = await fetch("/api/biChat/id");

        if (!response.ok) {
          throw new Error(`API error: ${response.statusText}`);
        }

        const data = await response.json();

        if (!isMounted) return;

        if (data.id) {
          setLocalId(data.id);
          router.push(`/chat/${data.id}`, { scroll: false });
        } else {
          throw new Error("Failed to retrieve chat ID from API");
        }
      } catch (err) {
        console.error("Failed to initialize chat:", err);

        if (!isMounted) return;

        setError(
          err instanceof Error ? err.message : "Failed to initialize chat"
        );
        setIsLoading(false);
      }
    }

    fetchChatId();

    return () => {
      isMounted = false;
    };
  }, [localId, router, isLoading]);

  // If ID from props changes, update localId
  useEffect(() => {
    if (id && id !== localId) {
      setLocalId(id);
      setError(null);
      setIsLoading(false);
    }
  }, [id, localId]);

  return {
    error,
    localId,
    isLoadingId: isLoading && !localId,
  };
}
