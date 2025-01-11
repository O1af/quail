"use server";
import { PostgresRequest, PostgresResponse } from "@/types/DatabaseTypes";
import { createClient } from "../supabase/server";
import { MySQLRequest } from "@/types/DatabaseTypes";

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
    throw new Error("Function endpoint not configured");
  }
  const supabase = await createClient();

  const { data: user, error } = await supabase.auth.getUser();
  if (error || !user) {
    throw new Error("Unauthorized");
  }

  // Update usage metrics
  await updateMetricUsage(supabase, user.user.id, getCurrentUsageColumn());

  const response = await fetch(
    process.env.NEXT_PUBLIC_AZURE_FUNCTION_ENDPOINT + endpoint,
    {
      method: "POST",
      body: JSON.stringify(request),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Database error: ${error}`);
  }

  return await response.json();
}

export async function runPostgres(
  request: PostgresRequest
): Promise<PostgresResponse> {
  return executeWithUsageTracking("/runPostgres", request);
}

export async function runMySQL(
  request: MySQLRequest
): Promise<PostgresResponse> {
  return executeWithUsageTracking("/runMySQL", request);
}
