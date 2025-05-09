import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

interface UseAuthCheckOptions {
  redirectPath?: string;
}

export function useAuthCheck(options: UseAuthCheckOptions = {}) {
  const { redirectPath = "/login" } = options;
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          // Allow for both absolute URLs and relative paths
          const fullRedirectUrl = redirectPath.startsWith("http")
            ? redirectPath
            : `${process.env.NEXT_PUBLIC_APP_URL}${redirectPath}`;

          window.location.href = fullRedirectUrl;
          return;
        }

        setUser(user);
      } catch (error) {
        console.error("Error authenticating user:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [supabase, redirectPath]);

  return { user, loading };
}
