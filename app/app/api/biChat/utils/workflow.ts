import { DataStreamWriter, Message, Provider } from "ai";
import { executeQuery } from "@/components/stores/utils/query";
import { tryCatch } from "@/lib/trycatch";
import { DatabaseStructure } from "@/components/stores/table_store";
import { generateText } from "ai";

/**
 * Updates the status in the data stream with just a step number
 * Steps:
 * 0: Thinking/Understanding
 * 1: Executing SQL query
 * 2: Analyzing results
 * 3: Creating visualization
 */
export async function updateStatus(
  stream: DataStreamWriter,
  step: number
): Promise<void> {
  try {
    console.log("Sending step update:", step);
    await stream.writeData(step);
  } catch (error) {
    console.error("Failed to update status:", error);
  }
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
  createQueryValidationPrompt?: (params: {
    originalQuery: string;
    errorMessage: string;
    dbType: string;
    databaseStructure: DatabaseStructure;
  }) => string;
}) {
  let currentQuery = query;
  let attempts = 0;

  while (attempts <= maxRetries) {
    // Update status to step 1 (querying)
    await updateStatus(stream, 1);

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

      // Still on step 1 for query retries

      // Always use o3-mini for query validation regardless of user tier
      const { data: improvedQueryData, error: reformError } = await tryCatch(
        generateText({
          model: provider("o3-mini"),
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
        console.log("Fixed query:", currentQuery);
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
