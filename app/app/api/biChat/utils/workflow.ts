import { DataStreamWriter, Message, Provider } from "ai";
import { executeQuery } from "@/components/stores/utils/query";
import { tryCatch } from "@/lib/trycatch";
import { DatabaseStructure } from "@/components/stores/table_store";
import { generateText } from "ai";

export async function updateStatus(
  stream: DataStreamWriter,
  status: string,
  data?: any
) {
  await stream.writeData({
    status,
    data,
  });
}

export async function executeQueryWithErrorHandling({
  query,
  connectionString,
  dbType,
  maxRetries = 1,
  stream,
  dbSchema,
  provider,
  createQueryValidationPrompt,
}: {
  query: string;
  connectionString: string;
  dbType: string;
  maxRetries: number;
  stream: DataStreamWriter;
  dbSchema?: DatabaseStructure;
  provider?: any;
  createQueryValidationPrompt?: Function;
}) {
  let currentQuery = query;
  let attempts = 0;

  while (attempts <= maxRetries) {
    await updateStatus(
      stream,
      attempts === 0
        ? "Executing database query..."
        : "Executing reformulated query...",
      { query: currentQuery, attempt: attempts + 1 }
    );

    const { data, error } = await tryCatch(
      executeQuery(currentQuery, connectionString, dbType)
    );

    if (!error && data?.rows?.length > 0) {
      return { data, query: currentQuery, success: true };
    }

    if (
      attempts < maxRetries &&
      provider &&
      createQueryValidationPrompt &&
      dbSchema
    ) {
      const errorMessage = error
        ? `Error executing query: ${error.message}`
        : "Query executed but returned no results.";

      await updateStatus(stream, "Query failed. Attempting to fix...", {
        error: error?.message || "No results returned",
      });

      // Always use o3-mini for query validation regardless of user tier
      const { data: improvedQueryData, error: reformError } = await tryCatch(
        generateText({
          model: provider("o3-mini"), // Explicitly use o3-mini
          prompt: createQueryValidationPrompt({
            originalQuery: currentQuery,
            errorMessage,
            dbType,
            databaseStructure: dbSchema,
          }),
          system: "Fix the SQL query to address the error or no-results issue.",
        })
      );

      if (!reformError && improvedQueryData) {
        currentQuery = improvedQueryData.text.trim();

        // Log the fixed query for debugging
        console.log("Fixed query:", currentQuery);

        await updateStatus(stream, "Attempting with fixed query...", {
          fixedQuery: currentQuery,
        });
      } else {
        await updateStatus(stream, "Failed to fix query", {
          error: reformError?.message,
        });
      }
    }

    attempts++;
  }

  return {
    data: null,
    query: currentQuery,
    success: false,
  };
}
