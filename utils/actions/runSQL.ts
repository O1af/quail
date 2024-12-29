"use server";
import { PostgresRequest, PostgresResponse } from "@/utils/types/DatabaseTypes";

export async function runPostgres(
  request: PostgresRequest
): Promise<PostgresResponse> {
  if (!process.env.AZURE_FUNCTION_ENDPOINT) {
    throw new Error("Function endpoint not configured");
  }

  const response = await fetch(
    process.env.AZURE_FUNCTION_ENDPOINT + "/runPostgres",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Database error: ${error}`);
  }

  return await response.json();
}
