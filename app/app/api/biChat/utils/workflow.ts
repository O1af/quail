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
  modelName,
  createQueryValidationPrompt,
}: {
  query: string;
  connectionString: string;
  dbType: string;
  maxRetries: number;
  stream: DataStreamWriter;
  dbSchema?: DatabaseStructure;
  provider?: any;
  modelName?: string;
  createQueryValidationPrompt?: Function;
}) {
  let currentQuery = query;
  let attempts = 0;
  let validationPromptUsed = null;

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
      return { data, query: currentQuery, success: true, validationPromptUsed };
    }

    if (
      attempts < maxRetries &&
      provider &&
      modelName &&
      createQueryValidationPrompt &&
      dbSchema
    ) {
      const errorMessage = error
        ? `Error executing query: ${error.message}`
        : "Query executed but returned no results.";

      // Generate improved query based on error

      await updateStatus(stream, "Query failed. Attempting to fix issues...", {
        error: error?.message || "No results returned",
      });

      const { data: improvedQueryData, error: reformError } = await tryCatch(
        generateText({
          model: provider(modelName),
          prompt: createQueryValidationPrompt({
            originalQuery: currentQuery,
            errorMessage,
            dbType,
            databaseStructure: dbSchema,
          }),
          system:
            "You are a database expert who fixes SQL queries that contain errors.",
        })
      );

      if (!reformError && improvedQueryData) {
        currentQuery = improvedQueryData.text;
      }
    }

    attempts++;
  }

  return {
    data: null,
    query: currentQuery,
    success: false,
    validationPromptUsed,
  };
}

/**
 * Perform quality checks on generated SQL query
 */
export function performQueryQualityChecks(
  query: string,
  dbSchema: DatabaseStructure
): { passes: boolean; issues: string[] } {
  const issues: string[] = [];

  // Basic syntax checks
  if (!query.toLowerCase().includes("select")) {
    issues.push("Query missing SELECT statement");
  }

  if (!query.toLowerCase().includes("from")) {
    issues.push("Query missing FROM clause");
  }

  if (!query.toLowerCase().includes("limit")) {
    issues.push("Query missing LIMIT clause");
  }

  // Check for table references - simplified version
  const tableList = getAllTables(dbSchema);
  let foundAnyTable = false;

  for (const table of tableList) {
    if (query.toLowerCase().includes(table.toLowerCase())) {
      foundAnyTable = true;
      break;
    }
  }

  if (!foundAnyTable) {
    issues.push("Query doesn't reference any known tables");
  }

  return {
    passes: issues.length === 0,
    issues,
  };
}

/**
 * Get all table names from database schema
 */
function getAllTables(dbSchema: DatabaseStructure): string[] {
  const tables: string[] = [];

  for (const schema of dbSchema.schemas) {
    for (const table of schema.tables) {
      tables.push(table.name);
    }
  }

  return tables;
}
