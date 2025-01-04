"use server";
import { PostgresRequest, PostgresResponse } from "@/utils/types/DatabaseTypes";
import { createClient } from "../supabase/server";

export async function runPostgres(
  request: PostgresRequest
): Promise<PostgresResponse> {
  if (!process.env.AZURE_FUNCTION_ENDPOINT) {
    throw new Error("Function endpoint not configured");
  }
  const supabase = await createClient();

  const { data: user, error } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("Unauthorized");
  }

  const response = await fetch(
    process.env.AZURE_FUNCTION_ENDPOINT + "/runPostgres",
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
