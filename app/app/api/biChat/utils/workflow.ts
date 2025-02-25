import { DataStreamWriter, Message, Provider } from "ai";
import { executeQuery } from "@/components/stores/utils/query";
import { tryCatch } from "@/lib/trycatch";
import { DatabaseStructure } from "@/components/stores/table_store";
import { generateText } from "ai";

/**
 * Workflow stages for the BI Chat agent
 */
export enum WorkflowStage {
  UNDERSTANDING_REQUEST = "understanding_request",
  GENERATING_QUERY = "generating_query",
  VALIDATING_QUERY = "validating_query",
  EXECUTING_QUERY = "executing_query",
  REFORMULATING_QUERY = "reformulating_query",
  GENERATING_VISUALIZATION = "generating_visualization",
  ANALYZING_RESULTS = "analyzing_results",
  COMPLETED = "completed",
  ERROR = "error",
}

/**
 * Update the data stream with the current workflow stage
 */
export async function updateWorkflowStage(
  stream: DataStreamWriter,
  stage: WorkflowStage,
  message: string,
  data?: any
) {
  await stream.writeData({
    status: stage,
    message,
    data: { step: getStepNumber(stage), ...data },
  });
}

/**
 * Map workflow stage to numeric step for progress tracking
 */
function getStepNumber(stage: WorkflowStage): number {
  const stepMap: Record<WorkflowStage, number> = {
    [WorkflowStage.UNDERSTANDING_REQUEST]: 0,
    [WorkflowStage.GENERATING_QUERY]: 1,
    [WorkflowStage.VALIDATING_QUERY]: 1.5,
    [WorkflowStage.EXECUTING_QUERY]: 2,
    [WorkflowStage.REFORMULATING_QUERY]: 2.5,
    [WorkflowStage.GENERATING_VISUALIZATION]: 3,
    [WorkflowStage.ANALYZING_RESULTS]: 4,
    [WorkflowStage.COMPLETED]: 5,
    [WorkflowStage.ERROR]: -1,
  };
  return stepMap[stage];
}

/**
 * Execute query with error handling and possible reformulation
 */
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

  while (attempts <= maxRetries) {
    await updateWorkflowStage(
      stream,
      WorkflowStage.EXECUTING_QUERY,
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
      modelName &&
      createQueryValidationPrompt &&
      dbSchema
    ) {
      await updateWorkflowStage(
        stream,
        WorkflowStage.REFORMULATING_QUERY,
        "Query failed. Attempting to fix issues...",
        { error: error?.message || "No results returned" }
      );

      const errorMessage = error
        ? `Error executing query: ${error.message}`
        : "Query executed but returned no results.";

      // Generate improved query based on error
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

  return { data: null, query: currentQuery, success: false };
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
