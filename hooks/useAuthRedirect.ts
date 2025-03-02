import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

export function useAuthRedirect() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    const checkUser = async () => {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (error) {
          throw error;
        }

        if (!user) {
          window.location.href = `${process.env.NEXT_PUBLIC_APP_URL}/login`;
          return;
        }

        setUser(user);
      } catch (err: any) {
        console.error("Authentication error:", err);
        setError(err.message || "Authentication failed");
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, [supabase]);

  return { user, loading, error };
}
