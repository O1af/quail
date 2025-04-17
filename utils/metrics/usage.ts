"use server";
import { createClient } from "@/utils/supabase/server";
import { getCurrentUsageColumn } from "./AI";

export type UsageStats = {
  queries: number;
  limit: number;
};

/**
 * Fetches the user's current month usage statistics as a simple integer
 */
export async function getUserUsageStats(): Promise<UsageStats> {
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  // Get current month column
  const currentUsageColumn = getCurrentUsageColumn();

  // Get user's tier and query count in parallel
  const [profileResult, usageResult] = await Promise.all([
    supabase.from("profiles").select("tier").eq("id", user.id).single(),
    supabase
      .from("req_count")
      .select(currentUsageColumn)
      .eq("id", user.id)
      .single(),
  ]);

  // Handle errors
  if (profileResult.error && profileResult.error.code !== "PGRST116") {
    console.error("Error fetching profile data:", profileResult.error);
    throw new Error("Failed to fetch usage data");
  }

  if (usageResult.error && usageResult.error.code !== "PGRST116") {
    console.error("Error fetching usage data:", usageResult.error);
    throw new Error("Failed to fetch usage data");
  }

  const tier = profileResult.data?.tier || "Free";
  // Handle case where data might be null (zero rows) by defaulting to 0
  const count = usageResult.data
    ? (usageResult.data as any)[currentUsageColumn] ?? 0
    : 0;

  // Calculate usage limit based on tier
  const usageLimit =
    tier === "Pro"
      ? 10000
      : parseInt(process.env.FREE_TIER_MONTHLY_LIMIT || "100");

  return {
    queries: count,
    limit: usageLimit,
  };
}
