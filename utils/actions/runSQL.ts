"use server";
import { PostgresRequest, PostgresResponse } from "@/lib/types/DBQueryTypes";
import { createClient } from "../supabase/server";
import { MySQLRequest } from "@/lib/types/DBQueryTypes";

function getCurrentUsageColumn(): string {
  const now = new Date();
  const month = now.toLocaleString("default", { month: "long" }).toLowerCase();
  const year = now.getFullYear();
  return `${month}_${year}`;
}

async function updateMetricUsage(
  supabase: any,
  userId: string,
  columnName: string
) {
  const { error } = await supabase.rpc("increment_column", {
    p_user_id: userId,
    p_column_name: columnName,
  });
  if (error) throw new Error(`Failed to update SQL usage: ${error.message}`);
}

async function executeWithUsageTracking<T>(
  endpoint: string,
  request: T
): Promise<PostgresResponse> {
  if (!process.env.NEXT_PUBLIC_AZURE_FUNCTION_ENDPOINT) {
    return { rows: [], rowCount: 0, error: "Function endpoint not configured" };
  }
  const supabase = await createClient();

  const { data: user, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { rows: [], rowCount: 0, error: "Unauthorized" };
  }

  // Start metrics update in background
  const metricsPromise = updateMetricUsage(
    supabase,
    user.user.id,
    getCurrentUsageColumn()
  ).catch((error) => {
    console.error("Failed to update usage metrics:", error);
  });

  const tier = await supabase
    .from("profiles")
    .select("tier")
    .eq("id", user.user.id)
    .single();

  const requestWithTier = {
    ...request,
    userTier: tier.data?.tier,
  };

  try {
    const response = await fetch(
      process.env.NEXT_PUBLIC_AZURE_FUNCTION_ENDPOINT + endpoint,
      {
        method: "POST",
        body: JSON.stringify(requestWithTier),
      }
    );

    if (!response.ok) {
      const err = await response.text();
      return {
        rows: [],
        rowCount: 0,
        error: err || "Database error occurred",
      };
    }
    const result = await response.json();

    await metricsPromise;
    return result;
  } catch (error) {
    return {
      rows: [],
      rowCount: 0,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

export async function runPostgres(
  request: PostgresRequest
): Promise<PostgresResponse> {
  return executeWithUsageTracking(
    "/runPostgres?code=V0PdXraT6fpnnYarj7Ighojfva5GIEWI3cIiiS_USbq6AzFuWAw2iQ==",
    request
  );
}

export async function runMySQL(
  request: MySQLRequest
): Promise<PostgresResponse> {
  return executeWithUsageTracking(
    "/runMySQL?code=V0PdXraT6fpnnYarj7Ighojfva5GIEWI3cIiiS_USbq6AzFuWAw2iQ==",
    request
  );
}
