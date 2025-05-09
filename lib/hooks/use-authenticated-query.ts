"use client";

import { useEffect, useState } from "react";
import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { createClient } from "@/utils/supabase/client";

/**
 * A custom hook that checks if the user is authenticated before executing a React Query
 * This is helpful for situations where we need to ensure authentication before
 * making a query that requires authentication
 */
export function useAuthenticatedQuery<
  TData,
  TQueryKey extends readonly unknown[] = readonly unknown[]
>(
  queryKey: TQueryKey,
  queryFn: () => Promise<TData>,
  options?: Omit<
    UseQueryOptions<TData, Error, TData, TQueryKey>,
    "queryKey" | "queryFn"
  >
) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase.auth.getUser();

        if (error) {
          console.error("Auth check error:", error);
          setIsAuthenticated(false);
          return;
        }

        setIsAuthenticated(!!data.user);
      } catch (error) {
        console.error("Auth check failed:", error);
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  // Only enable the query when we've confirmed authentication
  return useQuery<TData, Error, TData, TQueryKey>({
    queryKey,
    queryFn,
    ...(options as any), // Type assertion to avoid complex spread issues
    enabled: isAuthenticated === true && options?.enabled !== false,
  });
}

/**
 * A hook to determine if the user is authenticated. This can be used
 * to conditionally render components or enable functionality.
 */
export function useIsAuthenticated() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true);
        const supabase = createClient();
        const { data, error } = await supabase.auth.getUser();

        if (error || !data.user) {
          setIsAuthenticated(false);
          setUserId(null);
          return;
        }

        setIsAuthenticated(true);
        setUserId(data.user.id);
      } catch (error) {
        console.error("Auth check failed:", error);
        setIsAuthenticated(false);
        setUserId(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  return { isAuthenticated, isLoading, userId };
}
